import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  fetchPrivacyReview,
  setCurrentPrivacyReview,
  validatePrivacyReview,
} from "@/api/privacy";
import { ValidationAlertList } from "@/components/common/ValidationAlertList";
import { PrivacyEmailFlowPanel } from "@/components/privacy/PrivacyEmailFlowPanel";
import { getApiErrorMessage } from "@/config/apiClient";
import {
  PRIVACY_ACCESSIBILITY_LABELS,
  PRIVACY_INACCESSIBLE_REASON_LABELS,
  PRIVACY_SCENARIO_LABELS,
  type PrivacyReview,
  type PrivacyValidationResult,
} from "@/types/privacy";
import {
  OPERATIONAL_OUTCOME_LABELS,
  PRIVACY_EMAIL_FLOW_LABELS,
} from "@/types/privacyOutcome";

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">{value ?? "—"}</Typography>
    </Box>
  );
}

export function PrivacyDetailPage() {
  const { brandId, reviewId } = useParams<{
    brandId: string;
    reviewId: string;
  }>();
  const [review, setReview] = useState<PrivacyReview | null>(null);
  const [validation, setValidation] = useState<PrivacyValidationResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [settingCurrent, setSettingCurrent] = useState(false);

  const load = useCallback(async () => {
    if (!reviewId) return;
    try {
      setLoading(true);
      const data = await fetchPrivacyReview(reviewId);
      setReview(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleValidate = async () => {
    if (!reviewId) return;
    try {
      setValidating(true);
      const result = await validatePrivacyReview(reviewId);
      setValidation(result);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setValidating(false);
    }
  };

  const handleSetCurrent = async () => {
    if (!reviewId) return;
    try {
      setSettingCurrent(true);
      const updated = await setCurrentPrivacyReview(reviewId);
      setReview(updated);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSettingCurrent(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !review) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!review) return null;

  return (
    <Box maxWidth={900}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Revision #{review.reviewNumber}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={PRIVACY_SCENARIO_LABELS[review.scenarioType]}
              size="small"
            />
            <Chip label={review.status} size="small" color="primary" variant="outlined" />
            {review.isCurrent && (
              <Chip label="Vigente" size="small" color="success" />
            )}
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            onClick={() => void handleValidate()}
            disabled={validating}
          >
            {validating ? "Validando..." : "Validar"}
          </Button>
          {!review.isCurrent && review.status !== "SUPERSEDED" && (
            <Button
              variant="contained"
              onClick={() => void handleSetCurrent()}
              disabled={settingCurrent}
            >
              {settingCurrent ? "Marcando..." : "Marcar como vigente"}
            </Button>
          )}
          <Button
            component={RouterLink}
            to={`/brands/${brandId}/privacy/${reviewId}/edit`}
            variant="outlined"
          >
            Editar
          </Button>
          <Button
            component={RouterLink}
            to={`/brands/${brandId}/privacy`}
            variant="text"
          >
            Volver
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {validation && (
        <Box mb={2}>
          {validation.valid ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Validacion superada sin errores bloqueantes.
            </Alert>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              La revision tiene errores bloqueantes.
            </Alert>
          )}
          <ValidationAlertList
            blocking={validation.blocking}
            warnings={validation.warnings}
          />
        </Box>
      )}

      {review.operationalOutcome === "NO_POLICY" && brandId && (
        <PrivacyEmailFlowPanel
          review={review}
          brandId={brandId}
          onReviewUpdated={setReview}
        />
      )}

      <Paper sx={{ p: 3 }}>
        <FieldRow label="URL politica" value={review.privacyPolicyUrl} />
        <FieldRow label="URL Facebook" value={review.facebookPageUrl} />
        <FieldRow
          label="Hosting externo"
          value={review.externalHostingProvider}
        />
        <Divider sx={{ my: 2 }} />
        <FieldRow
          label="Idioma"
          value={review.policyLanguages.join(", ")}
        />
        <Divider sx={{ my: 2 }} />
        <FieldRow
          label="Accesibilidad"
          value={PRIVACY_ACCESSIBILITY_LABELS[review.accessibilityStatus]}
        />
        <FieldRow
          label="Motivo inaccesible"
          value={
            review.inaccessibleReason
              ? review.inaccessibleReason === "OTHER" && review.findings
                ? `${PRIVACY_INACCESSIBLE_REASON_LABELS.OTHER}: ${review.findings}`
                : PRIVACY_INACCESSIBLE_REASON_LABELS[review.inaccessibleReason]
              : null
          }
        />
        <Divider sx={{ my: 2 }} />
        <FieldRow
          label="Caso operativo"
          value={
            review.operationalOutcome
              ? OPERATIONAL_OUTCOME_LABELS[review.operationalOutcome]
              : "—"
          }
        />
        {review.operationalOutcome === "NO_POLICY" && (
          <FieldRow
            label="Seguimiento de correos"
            value={PRIVACY_EMAIL_FLOW_LABELS[review.privacyEmailFlowStatus]}
          />
        )}
        <Divider sx={{ my: 2 }} />
        <FieldRow
          label="Actualizado"
          value={new Date(review.updatedAt).toLocaleString()}
        />
      </Paper>
    </Box>
  );
}
