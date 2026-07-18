import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import Button from "@mui/material/Button";
import type { PrivacyReview } from "@/types/privacy";
import {
  OPERATIONAL_OUTCOME_LABELS,
  PRIVACY_POLICY_LANGUAGE_LABELS,
  resolveCtaAssignment,
} from "@/types/privacyOutcome";

interface SubmissionPrivacyOutcomeSummaryProps {
  privacyReview: PrivacyReview | null;
  brandId: string | null;
}

export function SubmissionPrivacyOutcomeSummary({
  privacyReview,
  brandId,
}: SubmissionPrivacyOutcomeSummaryProps) {
  if (!privacyReview) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Privacy Outcome Summary
        </Typography>
        <Alert severity="warning">
          No hay privacy review vigente. Complete el Privacy Assessment antes de
          preparar el envío.
          {brandId && (
            <Button
              component={RouterLink}
              to={`/brands/${brandId}/privacy`}
              size="small"
              sx={{ ml: 2 }}
            >
              Ir a privacidad
            </Button>
          )}
        </Alert>
      </Paper>
    );
  }

  const outcome = privacyReview.operationalOutcome;
  const cta = resolveCtaAssignment(outcome, privacyReview.policyLanguages);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Privacy Outcome Summary
      </Typography>

      {!outcome && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Outcome operativo no definido. El operador debe seleccionarlo durante
          el Privacy Assessment.
          {brandId && (
            <Button
              component={RouterLink}
              to={`/brands/${brandId}/privacy/${privacyReview.id}/edit`}
              size="small"
              sx={{ ml: 2 }}
            >
              Editar privacy review
            </Button>
          )}
        </Alert>
      )}

      {outcome && (
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="body2">
            <strong>Outcome:</strong> {OPERATIONAL_OUTCOME_LABELS[outcome]}
          </Typography>

          {outcome === "NO_POLICY" && (
            <Alert severity="error">
              La creación y edición operativa del envío está bloqueada. No existe
              política de privacidad operativa válida para esta marca.
            </Alert>
          )}

          {outcome !== "NO_POLICY" && (
            <>
              {cta.policyLanguage ? (
                <Typography variant="body2">
                  <strong>Privacy Policy Language:</strong>{" "}
                  {PRIVACY_POLICY_LANGUAGE_LABELS[cta.policyLanguage]}
                </Typography>
              ) : cta.ambiguousLanguage ? (
                <Alert severity="warning">
                  HARD_TO_FIND con múltiples idiomas de política. Defina un único
                  idioma en el Privacy Assessment para asignar CTA.
                </Alert>
              ) : null}

              {cta.templateKey && (
                <Typography variant="body2">
                  <strong>Assigned CTA Template:</strong> {cta.templateKey}
                </Typography>
              )}

            </>
          )}
        </Box>
      )}
    </Paper>
  );
}
