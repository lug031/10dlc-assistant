import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router";
import { archiveBrand, fetchBrand, unarchiveBrand } from "@/api/brands";
import { fetchCampaignGate, fetchCampaigns, fetchSubmissions } from "@/api/campaigns";
import { fetchCurrentPrivacyReview } from "@/api/privacy";
import { CampaignCreationGateAlert } from "@/components/campaigns/CampaignCreationGateAlert";
import { deriveBrandOperationalPending } from "@/components/brands/BrandDocumentChecklist";
import { CAMPAIGN_GATE_MESSAGES } from "@/types/campaignGate";
import { getApiErrorMessage } from "@/config/apiClient";
import type { Brand } from "@/types/brand";
import type { Campaign, CampaignSubmission } from "@/types/campaign";
import type { CampaignGateResult } from "@/types/campaignGate";
import type { PrivacyReview } from "@/types/privacy";
import {
  OPERATIONAL_OUTCOME_LABELS,
  PRIVACY_POLICY_LANGUAGE_LABELS,
} from "@/types/privacyOutcome";

type CampaignSubmissionSummary = {
  id: string;
  submissionNumber: number;
  status: CampaignSubmission["status"];
  updatedAt: string;
};

function pickPreferredSubmission(
  items: CampaignSubmission[],
): CampaignSubmissionSummary | null {
  if (items.length === 0) return null;

  const approved = items.find((item) => item.status === "APPROVED");
  const rejected = items.find((item) => item.status === "REJECTED");
  const submitted = items.find((item) => item.status === "SUBMITTED");
  const candidate = approved ?? rejected ?? submitted ?? items[0];
  return {
    id: candidate.id,
    submissionNumber: candidate.submissionNumber,
    status: candidate.status,
    updatedAt: candidate.updatedAt,
  };
}

function submissionTcrLabel(status: CampaignSubmission["status"]): string {
  if (status === "SUBMITTED") return "Registrada en TCR";
  if (status === "REJECTED") return "Rechazada en TCR";
  if (status === "APPROVED") return "Aprobada en TCR";
  if (status === "READY") return "Lista para TCR";
  return "Pendiente de registro";
}

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

export function BrandDetailPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [currentPrivacy, setCurrentPrivacy] = useState<PrivacyReview | null>(
    null,
  );
  const [gate, setGate] = useState<CampaignGateResult | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [primarySubmissionId, setPrimarySubmissionId] = useState<string | null>(
    null,
  );
  const [submissionByCampaignId, setSubmissionByCampaignId] = useState<
    Record<string, CampaignSubmissionSummary>
  >({});
  const [latestSubmission, setLatestSubmission] = useState<{
    campaignName: string;
    submissionNumber: number;
    status: CampaignSubmission["status"];
    updatedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);

  const load = useCallback(async () => {
    if (!brandId) return;
    try {
      setLoading(true);
      const [brandData, privacy, gateResult, campaignList] = await Promise.all([
        fetchBrand(brandId),
        fetchCurrentPrivacyReview(brandId),
        fetchCampaignGate(brandId),
        fetchCampaigns(brandId),
      ]);
      const submissionsByCampaign = await Promise.all(
        campaignList.map(async (campaign) => ({
          campaignId: campaign.id,
          campaignName: campaign.internalName,
          items: await fetchSubmissions(campaign.id),
        })),
      );
      const submissionMap: Record<string, CampaignSubmissionSummary> = {};
      for (const { campaignId, items } of submissionsByCampaign) {
        const preferred = pickPreferredSubmission(items);
        if (preferred) {
          submissionMap[campaignId] = preferred;
        }
      }
      const primaryCampaign = campaignList[0];
      setPrimarySubmissionId(
        primaryCampaign ? (submissionMap[primaryCampaign.id]?.id ?? null) : null,
      );
      const latest = submissionsByCampaign
        .flatMap(({ campaignName, items }) =>
          items.map((submission) => ({
            campaignName,
            submissionNumber: submission.submissionNumber,
            status: submission.status,
            updatedAt: submission.updatedAt,
          })),
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )[0];
      setBrand(brandData);
      setCurrentPrivacy(privacy);
      setGate(gateResult);
      setCampaigns(campaignList);
      setSubmissionByCampaignId(submissionMap);
      setLatestSubmission(latest ?? null);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBrand(null);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    void load();
  }, [load, location.key]);

  const handleArchive = async () => {
    if (!brandId || !brand) return;
    if (!window.confirm("¿Archivar esta marca?")) return;
    try {
      setArchiving(true);
      await archiveBrand(brandId);
      navigate("/brands");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (!brandId || !brand) return;
    if (!window.confirm("¿Desarchivar esta marca?")) return;
    try {
      setUnarchiving(true);
      await unarchiveBrand(brandId);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUnarchiving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !brand) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button component={RouterLink} to="/brands" variant="outlined">
          Volver al listado
        </Button>
      </Box>
    );
  }

  if (!brand || !gate) {
    return null;
  }

  const isArchived = Boolean(brand.archivedAt);
  const pendingItems = deriveBrandOperationalPending(
    gate.allowed,
    gate.reasonCode ? CAMPAIGN_GATE_MESSAGES[gate.reasonCode] : null,
    gate.operationalOutcome,
    campaigns.length,
  );

  const primaryCampaign = campaigns[0];
  const campaignEditorPath =
    primaryCampaign && primarySubmissionId
      ? `/campaigns/${primaryCampaign.id}/submissions/${primarySubmissionId}`
      : primaryCampaign
        ? `/campaigns/${primaryCampaign.id}`
        : null;
  const primarySubmission = primaryCampaign
    ? submissionByCampaignId[primaryCampaign.id]
    : null;
  const campaignRegisteredInTcr = primarySubmission?.status === "SUBMITTED";
  const campaignRejectedInTcr = primarySubmission?.status === "REJECTED";
  const campaignApprovedInTcr = primarySubmission?.status === "APPROVED";

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
            {brand.legalName}
          </Typography>
          {brand.internalAlias && (
            <Typography color="text.secondary">{brand.internalAlias}</Typography>
          )}
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            <Chip label={brand.workflowStage} size="small" />
            <Chip
              label={`Marca TCR: ${brand.brandRegistrationStatus}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            {primarySubmission && (
              <Chip
                label={`Campaña TCR: ${submissionTcrLabel(primarySubmission.status)}`}
                size="small"
                color={
                  primarySubmission.status === "SUBMITTED" ||
                  primarySubmission.status === "APPROVED"
                    ? "success"
                    : primarySubmission.status === "REJECTED"
                      ? "error"
                      : "warning"
                }
                variant={
                  primarySubmission.status === "SUBMITTED" ||
                  primarySubmission.status === "APPROVED"
                    ? "filled"
                    : "outlined"
                }
              />
            )}
            {isArchived && (
              <Chip label="Archivada" size="small" color="warning" />
            )}
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            component={RouterLink}
            to={`/brands/${brand.id}/communications`}
            variant="contained"
            disabled={isArchived}
          >
            Communications
          </Button>
          <Button
            component={RouterLink}
            to={`/brands/${brand.id}/privacy`}
            variant="contained"
            color="secondary"
            disabled={isArchived}
          >
            Privacy
          </Button>
          <Button
            component={RouterLink}
            to={`/brands/${brand.id}/edit`}
            variant="outlined"
            disabled={isArchived}
          >
            Editar
          </Button>
          {isArchived ? (
            <Button
              variant="contained"
              color="success"
              disabled={unarchiving}
              onClick={() => void handleUnarchive()}
            >
              {unarchiving ? "Desarchivando..." : "Desarchivar"}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="warning"
              disabled={archiving}
              onClick={() => void handleArchive()}
            >
              {archiving ? "Archivando..." : "Archivar"}
            </Button>
          )}
          <Button component={RouterLink} to="/brands" variant="text">
            Volver
          </Button>
        </Box>
      </Box>

      {isArchived && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Esta marca está archivada. Desarchívala para editarla o trabajar con
          campañas y privacidad.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {campaignRegisteredInTcr && primarySubmission && (
        <Alert severity="success" sx={{ mb: 2 }}>
          La campaña fue registrada en Campaign Registry (envío #
          {primarySubmission.submissionNumber}).
        </Alert>
      )}

      {campaignRejectedInTcr && primarySubmission && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          El registro de la campaña fue rechazado en Campaign Registry (envío #
          {primarySubmission.submissionNumber}). Debe presentarse la apelación.
        </Alert>
      )}

      {campaignApprovedInTcr && primarySubmission && (
        <Alert severity="success" sx={{ mb: 2 }}>
          La campaña fue aprobada en Campaign Registry (envío #
          {primarySubmission.submissionNumber}).
        </Alert>
      )}

      {!gate.allowed && (
        <CampaignCreationGateAlert gate={gate} brandId={brand.id} />
      )}
      {gate.reasonCode === "PRIVACY_REVIEW_NOT_CURRENT" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta marca no tiene una privacy review vigente. Próximo paso recomendado:
          completar Privacy Assessment.
        </Alert>
      )}
      {gate.reasonCode === "OPERATIONAL_OUTCOME_UNDEFINED" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          La privacy review vigente no tiene outcome operativo definido. Próximo
          paso recomendado: definir outcome en Privacy Assessment.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 2, maxWidth: 960 }}>
        <Typography variant="h6" gutterBottom>
          Hub operativo
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          <Chip
            label={
              gate.allowed
                ? "Campaign Gate: abierto"
                : "Campaign Gate: bloqueado"
            }
            color={gate.allowed ? "success" : "error"}
            size="small"
          />
          {gate.operationalOutcome && (
            <Chip
              label={`Caso: ${OPERATIONAL_OUTCOME_LABELS[gate.operationalOutcome]}`}
              size="small"
              variant="outlined"
            />
          )}
          {gate.ctaTemplate && (
            <Chip
              label={`CTA: ${gate.ctaTemplate}`}
              size="small"
              variant="outlined"
            />
          )}
          {gate.privacyLanguage && (
            <Chip
              label={`Política: ${PRIVACY_POLICY_LANGUAGE_LABELS[gate.privacyLanguage]}`}
              size="small"
              variant="outlined"
            />
          )}
          {primarySubmission && (
            <Chip
              label={`Envío #${primarySubmission.submissionNumber}: ${submissionTcrLabel(primarySubmission.status)}`}
              size="small"
              color={
                primarySubmission.status === "SUBMITTED" ? "success" : "default"
              }
              variant="outlined"
            />
          )}
        </Box>

        {pendingItems.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Pendientes operativos
            </Typography>
            <List dense disablePadding>
              {pendingItems.map((item) => (
                <ListItem key={item} disablePadding>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          mb={1}
        >
          <Typography variant="subtitle1">Campaña</Typography>
          {!isArchived && campaigns.length === 0 && gate.allowed && (
            <Button
              component={RouterLink}
              to={`/brands/${brand.id}/campaigns/new`}
              size="small"
              variant="outlined"
            >
              Crear campaña
            </Button>
          )}
          {!isArchived && campaigns.length > 0 && campaignEditorPath && (
            <Button
              component={RouterLink}
              to={campaignEditorPath}
              size="small"
              variant="outlined"
              color={
                campaignApprovedInTcr
                  ? "success"
                  : campaignRejectedInTcr
                    ? "error"
                    : campaignRegisteredInTcr
                      ? "success"
                      : "primary"
              }
            >
              {campaignApprovedInTcr
                ? "Ver campaña aprobada"
                : campaignRejectedInTcr
                  ? "Ver campaña rechazada"
                  : campaignRegisteredInTcr
                    ? "Ver campaña registrada"
                    : "Ver campaña"}
            </Button>
          )}
        </Box>
        {campaigns.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Sin campaña.
          </Typography>
        ) : (
          <List dense disablePadding>
            {campaigns.map((campaign) => {
              const submission = submissionByCampaignId[campaign.id];
              const tcrSuffix = submission
                ? ` · ${submissionTcrLabel(submission.status)}`
                : "";

              return (
              <ListItem key={campaign.id} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={
                    submission?.id
                      ? `/campaigns/${campaign.id}/submissions/${submission.id}`
                      : `/campaigns/${campaign.id}`
                  }
                >
                  <ListItemText
                    primary={campaign.internalName}
                    secondary={`${campaign.useCase} · ${campaign.currentStatus}${tcrSuffix}`}
                  />
                </ListItemButton>
              </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 2, maxWidth: 960 }}>
        <Typography variant="h6" gutterBottom>
          Operational Audit
        </Typography>
        <FieldRow
          label="Review vigente"
          value={
            currentPrivacy
              ? `#${currentPrivacy.reviewNumber} (${currentPrivacy.status})`
              : "No"
          }
        />
        <FieldRow
          label="Outcome vigente"
          value={
            gate.operationalOutcome
              ? OPERATIONAL_OUTCOME_LABELS[gate.operationalOutcome]
              : "No definido"
          }
        />
        <FieldRow
          label="Idioma de política"
          value={
            gate.privacyLanguage
              ? PRIVACY_POLICY_LANGUAGE_LABELS[gate.privacyLanguage]
              : "No definido"
          }
        />
        <FieldRow label="CTA asignado" value={gate.ctaTemplate ?? "No asignado"} />
        <FieldRow
          label="Estado Campaign Gate"
          value={gate.allowed ? "Abierto" : "Bloqueado"}
        />
        <FieldRow
          label="Campañas activas"
          value={campaigns.filter((c) => c.currentStatus === "ACTIVE").length}
        />
        <FieldRow
          label="Último submission"
          value={
            latestSubmission
              ? `${latestSubmission.campaignName} · #${latestSubmission.submissionNumber}`
              : "Sin submissions"
          }
        />
        <FieldRow
          label="Estado en TCR"
          value={
            latestSubmission
              ? submissionTcrLabel(latestSubmission.status)
              : "Sin envío"
          }
        />
      </Paper>

      <Paper sx={{ p: 3, mt: 2, maxWidth: 960 }}>
        <Typography variant="h6" gutterBottom>
          Datos legales
        </Typography>
        <FieldRow label="DBA" value={brand.dbaName} />
        <FieldRow label="Entity Type" value={brand.entityType} />
        <FieldRow label="Tax Number / ID / EIN" value={brand.einOrTaxId} />
        <FieldRow
          label="Country of Registration"
          value={brand.registrationCountry}
        />
        <FieldRow
          label="Tax Number / ID Issuing Country"
          value={brand.taxIdIssuingCountry}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Dirección
        </Typography>
        <FieldRow
          label="Address / Street"
          value={[brand.legalAddressLine1, brand.legalAddressLine2]
            .filter(Boolean)
            .join(", ")}
        />
        <FieldRow
          label="Ciudad / Estado / CP / País"
          value={`${brand.city}, ${brand.state} ${brand.postalCode}, ${brand.country}`}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Negocio
        </Typography>
        <FieldRow label="Vertical Type" value={brand.verticalType} />
        <FieldRow label="Support Phone Number" value={brand.supportPhoneNumber} />
        <FieldRow
          label="Support Email Address"
          value={brand.supportEmailAddress}
        />
        <FieldRow label="Website" value={brand.websiteUrl} />
        <Divider sx={{ my: 2 }} />
        <FieldRow
          label="Actualizado"
          value={new Date(brand.updatedAt).toLocaleString()}
        />
        {isArchived && brand.archivedAt && (
          <FieldRow
            label="Archivada"
            value={new Date(brand.archivedAt).toLocaleString()}
          />
        )}
      </Paper>
    </Box>
  );
}
