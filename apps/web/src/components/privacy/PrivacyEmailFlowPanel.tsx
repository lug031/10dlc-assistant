import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import {
  markPrivacyClientResponded,
  markPrivacyFollowupSent,
  markPrivacyInitialEmailSent,
} from "@/api/privacy";
import type { LeadwireCommunicationTemplateKey } from "@/constants/leadwireCommunicationTemplates";
import { getApiErrorMessage } from "@/config/apiClient";
import type { PrivacyReview } from "@/types/privacy";
import {
  getRecommendedPrivacyEmailTemplate,
  PRIVACY_EMAIL_FLOW_LABELS,
} from "@/types/privacyOutcome";
import { useState } from "react";

const FLOW_STEPS = [
  "Enviar correo inicial",
  "Esperar respuesta",
  "Enviar follow-up",
  "Cliente respondió",
] as const;

function activeStepIndex(status: PrivacyReview["privacyEmailFlowStatus"]): number {
  switch (status) {
    case "NOT_STARTED":
      return 0;
    case "WAITING_RESPONSE":
      return 1;
    case "FOLLOWUP_SENT":
      return 2;
    case "CLIENT_RESPONDED":
      return 3;
    default:
      return 0;
  }
}

interface PrivacyEmailFlowPanelProps {
  review: PrivacyReview;
  brandId: string;
  onReviewUpdated: (review: PrivacyReview) => void;
  onSelectTemplate?: (key: LeadwireCommunicationTemplateKey) => void;
}

export function PrivacyEmailFlowPanel({
  review,
  brandId,
  onReviewUpdated,
  onSelectTemplate,
}: PrivacyEmailFlowPanelProps) {
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (review.operationalOutcome !== "NO_POLICY") {
    return null;
  }

  const step = activeStepIndex(review.privacyEmailFlowStatus);
  const recommendedTemplate = getRecommendedPrivacyEmailTemplate(
    review.privacyEmailFlowStatus,
  );

  const runAction = async (action: () => Promise<PrivacyReview>) => {
    try {
      setActing(true);
      setError(null);
      const updated = await action();
      onReviewUpdated(updated);
      const nextTemplate = getRecommendedPrivacyEmailTemplate(
        updated.privacyEmailFlowStatus,
      );
      if (nextTemplate) {
        onSelectTemplate?.(nextTemplate);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Seguimiento CASO 1 — Sin política
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registre manualmente cada paso después de copiar y enviar el correo
            desde su cliente de email.
          </Typography>
        </Box>
        <Chip
          label={PRIVACY_EMAIL_FLOW_LABELS[review.privacyEmailFlowStatus]}
          color={
            review.privacyEmailFlowStatus === "CLIENT_RESPONDED"
              ? "success"
              : "warning"
          }
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {FLOW_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {review.privacyEmailFlowStatus === "NOT_STARTED" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Paso 1: copie la plantilla <strong>Privacidad — política no encontrada</strong>{" "}
          y envíela al cliente. Luego marque el correo como enviado.
        </Alert>
      )}

      {review.privacyEmailFlowStatus === "WAITING_RESPONSE" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Esperando respuesta del cliente
          {review.privacyInitialEmailSentAt
            ? ` (correo inicial: ${new Date(review.privacyInitialEmailSentAt).toLocaleString()})`
            : ""}
          . Si no responde, envíe el follow-up.
        </Alert>
      )}

      {review.privacyEmailFlowStatus === "FOLLOWUP_SENT" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Follow-up enviado
          {review.privacyFollowupSentAt
            ? ` el ${new Date(review.privacyFollowupSentAt).toLocaleString()}`
            : ""}
          . Siga esperando respuesta o marque cuando el cliente responda.
        </Alert>
      )}

      {review.privacyEmailFlowStatus === "CLIENT_RESPONDED" && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Cliente respondió
          {review.privacyClientRespondedAt
            ? ` el ${new Date(review.privacyClientRespondedAt).toLocaleString()}`
            : ""}
          . Cree una nueva revisión de privacidad con el outcome correcto (CASO 2
          o CASO 3).
        </Alert>
      )}

      <Box display="flex" gap={1} flexWrap="wrap">
        {recommendedTemplate && onSelectTemplate && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => onSelectTemplate(recommendedTemplate)}
          >
            Ver plantilla sugerida
          </Button>
        )}

        {review.privacyEmailFlowStatus === "NOT_STARTED" && (
          <Button
            variant="contained"
            size="small"
            disabled={acting}
            onClick={() =>
              void runAction(() => markPrivacyInitialEmailSent(review.id))
            }
          >
            Marcar correo inicial enviado
          </Button>
        )}

        {(review.privacyEmailFlowStatus === "WAITING_RESPONSE" ||
          review.privacyEmailFlowStatus === "FOLLOWUP_SENT") && (
          <>
            <Button
              variant="contained"
              size="small"
              disabled={acting}
              onClick={() =>
                void runAction(() => markPrivacyFollowupSent(review.id))
              }
            >
              Marcar follow-up enviado
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={acting}
              onClick={() =>
                void runAction(() => markPrivacyClientResponded(review.id))
              }
            >
              Cliente respondió
            </Button>
          </>
        )}

        {review.privacyEmailFlowStatus === "CLIENT_RESPONDED" && (
          <Button
            component={RouterLink}
            to={`/brands/${brandId}/privacy/new`}
            variant="contained"
            size="small"
          >
            Nueva revisión de privacidad
          </Button>
        )}
      </Box>
    </Paper>
  );
}
