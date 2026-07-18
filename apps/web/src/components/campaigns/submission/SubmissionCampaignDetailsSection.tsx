import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { BrandSnapshot, Campaign } from "@/types/campaign";
import type { PrivacyReview } from "@/types/privacy";
import {
  isSubmissionBlockedByOutcome,
  resolveCtaAssignment,
} from "@/types/privacyOutcome";
import type { CtaEditableParts } from "@/utils/ctaMessageFlow";
import { CtaMessageFlowEditor } from "./CtaMessageFlowEditor";

interface SubmissionCampaignDetailsSectionProps {
  campaign: Campaign;
  brandSnapshot: BrandSnapshot;
  privacyReview: PrivacyReview | null;
  campaignDescription: string;
  ctaEditableParts: CtaEditableParts;
  privacyPolicyLink: string;
  editable: boolean;
  onCampaignDescriptionChange: (value: string) => void;
  onCtaEditablePartsChange: (parts: CtaEditableParts, composed: string) => void;
}

export function SubmissionCampaignDetailsSection({
  campaign,
  brandSnapshot,
  privacyReview,
  campaignDescription,
  ctaEditableParts,
  privacyPolicyLink,
  editable,
  onCampaignDescriptionChange,
  onCtaEditablePartsChange,
}: SubmissionCampaignDetailsSectionProps) {
  const outcome = privacyReview?.operationalOutcome ?? null;
  const blocked = isSubmissionBlockedByOutcome(outcome);
  const ctaAssignment = resolveCtaAssignment(
    outcome,
    privacyReview?.policyLanguages ?? [],
  );
  const fieldsEditable = editable && !blocked;
  const ctaTemplateKey = ctaAssignment.templateKey;

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Campaign Details
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        *Required Fields
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Use-Case"
          value={campaign.useCase}
          disabled
          fullWidth
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              label="Campaign Description"
              value={campaignDescription}
              onChange={(e) => onCampaignDescriptionChange(e.target.value)}
              multiline
              minRows={8}
              disabled={!fieldsEditable}
              helperText="Mínimo 40 caracteres"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {ctaTemplateKey ? (
              <CtaMessageFlowEditor
                brandSnapshot={brandSnapshot}
                templateKey={ctaTemplateKey}
                parts={ctaEditableParts}
                operationalOutcome={outcome}
                disabled={!fieldsEditable}
                onChange={({ parts, composed }) =>
                  onCtaEditablePartsChange(parts, composed)
                }
              />
            ) : (
              <TextField
                label="Call-to-Action / Message Flow"
                value=""
                disabled
                helperText="Complete el Privacy Assessment para asignar CTA"
                multiline
                minRows={8}
                fullWidth
              />
            )}
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }} />
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              label="Privacy Policy Link"
              value={privacyPolicyLink}
              disabled
              helperText="Tomado de la privacy review vigente"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
