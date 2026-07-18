import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { getOperationalChecklistItems } from "@/constants/operationalChecklist";
import type { CampaignGateResult } from "@/types/campaignGate";
import type { CampaignSubmission } from "@/types/campaign";
import {
  OPERATIONAL_OUTCOME_LABELS,
  PRIVACY_POLICY_LANGUAGE_LABELS,
} from "@/types/privacyOutcome";
import {
  buildSampleMultimediaFilenames,
  isSampleMultimediaComplete,
} from "@/utils/sampleMultimedia";
import { parseCtaMessageFlow } from "@/utils/ctaMessageFlow";
import { resolveCtaAssignment } from "@/types/privacyOutcome";

export type TcrReadinessState =
  | "BLOCKED"
  | "NOT_READY"
  | "READY_FOR_MANUAL_TCR"
  | "SUBMITTED";

const READINESS_LABELS: Record<TcrReadinessState, string> = {
  BLOCKED: "Bloqueado",
  NOT_READY: "No listo para TCR",
  READY_FOR_MANUAL_TCR: "Listo para registro manual en TCR",
  SUBMITTED: "Enviado a TCR",
};

function deriveTcrReadiness(
  gate: CampaignGateResult,
  submissions: CampaignSubmission[],
): TcrReadinessState {
  if (!gate.allowed) {
    return "BLOCKED";
  }

  const latestSubmitted = submissions.find((s) => s.status === "SUBMITTED");
  if (latestSubmitted) {
    return "SUBMITTED";
  }

  const readySubmission = submissions.find((s) => s.status === "READY");
  if (readySubmission) {
    return "READY_FOR_MANUAL_TCR";
  }

  return "NOT_READY";
}

function collectPendingRequirements(
  gate: CampaignGateResult,
  submissions: CampaignSubmission[],
): string[] {
  const pending: string[] = [];

  if (!gate.allowed && gate.reasonCode) {
    pending.push(gate.reasonCode);
    return pending;
  }

  if (gate.ambiguousLanguage) {
    pending.push("CTA_POLICY_LANGUAGE_AMBIGUOUS");
  }

  if (gate.allowed) {
    const latestDraft = submissions.find(
      (s) => s.status === "DRAFT" || s.status === "READY",
    );
    if (latestDraft) {
      const ctaAssignment = resolveCtaAssignment(
        gate.operationalOutcome,
        [],
      );
      const ctaParts = parseCtaMessageFlow(
        latestDraft.ctaMessageFlow ?? "",
        ctaAssignment.templateKey,
        latestDraft.brandSnapshot,
      );
      const requiredFiles = buildSampleMultimediaFilenames(
        gate.operationalOutcome,
        ctaParts.optInKeyword,
      );
      if (
        !isSampleMultimediaComplete(
          latestDraft.sampleMultimediaConfirmation,
          requiredFiles,
        )
      ) {
        pending.push("SAMPLE_MULTIMEDIA_INCOMPLETE");
      }
    }
  }

  if (!submissions.some((s) => s.status === "READY")) {
    pending.push("NO_READY_SUBMISSION");
  }

  return pending;
}

interface CampaignOperationalSummaryProps {
  gate: CampaignGateResult;
  submissions: CampaignSubmission[];
}

export function CampaignOperationalSummary({
  gate,
  submissions,
}: CampaignOperationalSummaryProps) {
  const readiness = deriveTcrReadiness(gate, submissions);
  const pending = collectPendingRequirements(gate, submissions);
  const checklist = getOperationalChecklistItems(gate.operationalOutcome);

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
        mb={2}
      >
        <Typography variant="h6">Operational Summary</Typography>
        <Chip
          label={READINESS_LABELS[readiness]}
          color={
            readiness === "READY_FOR_MANUAL_TCR"
              ? "success"
              : readiness === "SUBMITTED"
                ? "info"
                : readiness === "BLOCKED"
                  ? "error"
                  : "warning"
          }
          size="small"
        />
      </Box>

      {gate.operationalOutcome && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Outcome:</strong>{" "}
          {OPERATIONAL_OUTCOME_LABELS[gate.operationalOutcome]}
        </Typography>
      )}

      {gate.privacyLanguage && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Privacy Policy Language:</strong>{" "}
          {PRIVACY_POLICY_LANGUAGE_LABELS[gate.privacyLanguage]}
        </Typography>
      )}

      {gate.ctaTemplate && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Assigned CTA Template:</strong> {gate.ctaTemplate}
        </Typography>
      )}


      {checklist.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Operational Checklist
          </Typography>
          <List dense>
            {checklist.map((item) => (
              <ListItem key={item} disablePadding>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {pending.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Requisitos pendientes
          </Typography>
          <List dense>
            {pending.map((item) => (
              <ListItem key={item} disablePadding>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
}
