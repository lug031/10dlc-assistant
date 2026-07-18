import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { OperationalOutcome, PrivacyReview } from "@/types/privacy";
import { OPERATIONAL_OUTCOME_SHORT_LABELS } from "@/types/privacyOutcome";

export type DocumentChecklistStatus = "COMPLETE" | "PENDING" | "NOT_APPLICABLE";

export interface DocumentChecklistItem {
  id: string;
  label: string;
  status: DocumentChecklistStatus;
  detail?: string;
}

const STATUS_LABELS: Record<DocumentChecklistStatus, string> = {
  COMPLETE: "Completo",
  PENDING: "Pendiente",
  NOT_APPLICABLE: "N/A",
};

const STATUS_COLORS: Record<
  DocumentChecklistStatus,
  "success" | "warning" | "default"
> = {
  COMPLETE: "success",
  PENDING: "warning",
  NOT_APPLICABLE: "default",
};

function privacyPolicyStatus(
  review: PrivacyReview | null,
): { status: DocumentChecklistStatus; detail?: string } {
  if (!review?.operationalOutcome) {
    return { status: "PENDING", detail: "Sin review vigente o outcome" };
  }

  const outcome = review.operationalOutcome;
  const label = OPERATIONAL_OUTCOME_SHORT_LABELS[outcome];

  if (outcome === "ACCESSIBLE_EN" || outcome === "ACCESSIBLE_ES") {
    return { status: "COMPLETE", detail: label };
  }

  if (outcome === "HARD_TO_FIND") {
    return { status: "COMPLETE", detail: label };
  }

  return { status: "PENDING", detail: label };
}

export function buildBrandDocumentChecklist(
  currentPrivacy: PrivacyReview | null,
): DocumentChecklistItem[] {
  const privacy = privacyPolicyStatus(currentPrivacy);

  return [
    {
      id: "privacy-policy",
      label: "Política de privacidad",
      status: privacy.status,
      detail: privacy.detail,
    },
  ];
}

function StatusIcon({ status }: { status: DocumentChecklistStatus }) {
  if (status === "COMPLETE") {
    return <CheckCircleIcon color="success" fontSize="small" />;
  }
  if (status === "PENDING") {
    return <ErrorOutlineIcon color="warning" fontSize="small" />;
  }
  return <HelpOutlineIcon color="disabled" fontSize="small" />;
}

interface BrandDocumentChecklistProps {
  currentPrivacy: PrivacyReview | null;
}

export function BrandDocumentChecklist({
  currentPrivacy,
}: BrandDocumentChecklistProps) {
  const items = buildBrandDocumentChecklist(currentPrivacy);

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Estado de privacidad
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Los datos legales de la marca (nombre, EIN, dirección, registro de
        comerciante) se recopilan en el Intake y al crear la marca. Aquí solo se
        muestra el avance de la política de privacidad.
      </Typography>
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <StatusIcon status={item.status} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="body2" fontWeight={600}>
                    {item.label}
                  </Typography>
                  <Chip
                    size="small"
                    label={STATUS_LABELS[item.status]}
                    color={STATUS_COLORS[item.status]}
                    variant="outlined"
                  />
                </Box>
              }
              secondary={item.detail}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export function deriveBrandOperationalPending(
  gateAllowed: boolean,
  gateReason: string | null,
  operationalOutcome: OperationalOutcome | null,
  campaignCount: number,
): string[] {
  const pending: string[] = [];

  if (!gateAllowed && gateReason) {
    pending.push(gateReason);
  }

  if (operationalOutcome === "NO_POLICY") {
    pending.push("Política de privacidad no disponible (NO_POLICY)");
  }

  if (campaignCount === 0 && gateAllowed) {
    pending.push("Sin campaña creada");
  }

  return pending;
}
