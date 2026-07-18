import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import { fetchBrand } from "@/api/brands";
import { fetchCurrentPrivacyReview } from "@/api/privacy";
import { LeadwireEmailPreview } from "@/components/communications/LeadwireEmailPreview";
import { PrivacyEmailFlowPanel } from "@/components/privacy/PrivacyEmailFlowPanel";
import {
  BRAND_COMMUNICATION_KEYS,
  LEADWIRE_COMMUNICATION_LABELS,
  type LeadwireCommunicationTemplateKey,
} from "@/constants/leadwireCommunicationTemplates";
import { getApiErrorMessage } from "@/config/apiClient";
import type { Brand } from "@/types/brand";
import type { PrivacyReview } from "@/types/privacy";
import {
  getRecommendedPrivacyEmailTemplate,
} from "@/types/privacyOutcome";
import { renderLeadwireCommunication } from "@/utils/leadwireCommunication";

export function CommunicationsPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [currentPrivacy, setCurrentPrivacy] = useState<PrivacyReview | null>(
    null,
  );
  const [activeKey, setActiveKey] =
    useState<LeadwireCommunicationTemplateKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!brandId) return;
    try {
      setLoading(true);
      const [data, privacy] = await Promise.all([
        fetchBrand(brandId),
        fetchCurrentPrivacyReview(brandId),
      ]);
      setBrand(data);
      setCurrentPrivacy(privacy);
      if (privacy?.operationalOutcome === "NO_POLICY") {
        const suggested = getRecommendedPrivacyEmailTemplate(
          privacy.privacyEmailFlowStatus,
        );
        setActiveKey(suggested);
      }
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBrand(null);
      setCurrentPrivacy(null);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!brand) {
    return <Alert severity="error">{error ?? "Marca no encontrada"}</Alert>;
  }

  const displayName = brand.dbaName?.trim() || brand.legalName;
  const context = { brand };

  const activeRendered = activeKey
    ? renderLeadwireCommunication(activeKey, context)
    : null;

  return (
    <Box>
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
            Communications
          </Typography>
          <Typography color="text.secondary">
            Marca: {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Correos de privacidad para avanzar hacia el registro de campaña.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to={`/brands/${brandId}`}
          variant="outlined"
        >
          Volver a marca
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {currentPrivacy?.operationalOutcome === "NO_POLICY" && brandId && (
        <PrivacyEmailFlowPanel
          review={currentPrivacy}
          brandId={brandId}
          onReviewUpdated={setCurrentPrivacy}
          onSelectTemplate={setActiveKey}
        />
      )}

      <Paper sx={{ p: 3, mb: 3, maxWidth: 900 }}>
        <Typography variant="subtitle1" gutterBottom>
          Plantillas de privacidad
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {BRAND_COMMUNICATION_KEYS.map((key) => (
            <Button
              key={key}
              variant={activeKey === key ? "contained" : "outlined"}
              onClick={() => setActiveKey(key)}
            >
              {LEADWIRE_COMMUNICATION_LABELS[key]}
            </Button>
          ))}
        </Box>
      </Paper>

      {activeKey && (
        <Box maxWidth={900}>
          <LeadwireEmailPreview
            templateId={activeKey}
            label={LEADWIRE_COMMUNICATION_LABELS[activeKey]}
            subject={activeRendered?.subject ?? null}
            body={activeRendered?.body ?? null}
          />
        </Box>
      )}

      {!activeKey && (
        <Alert severity="info" sx={{ maxWidth: 900 }}>
          Seleccione una plantilla de privacidad para copiar el texto operativo.
        </Alert>
      )}
    </Box>
  );
}
