import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  fetchCampaign,
  fetchCampaignGate,
  fetchSubmission,
  markSubmissionApproved,
  markSubmissionRejected,
  markSubmissionSubmitted,
  updateSubmission,
  validateSubmission,
} from "@/api/campaigns";
import { fetchCurrentPrivacyReview, fetchPrivacyReview } from "@/api/privacy";
import type { SubmissionStatus } from "@/types/campaign";
import { TcrCampaignRegistrationSummary } from "@/components/campaigns/TcrCampaignRegistrationSummary";
import { CampaignCreationGateAlert } from "@/components/campaigns/CampaignCreationGateAlert";
import { SubmissionCampaignDetailsSection } from "@/components/campaigns/submission/SubmissionCampaignDetailsSection";
import { SubmissionOptInOutHelpSection } from "@/components/campaigns/submission/SubmissionOptInOutHelpSection";
import { SubmissionOtherResponsiblePartiesSection } from "@/components/campaigns/submission/SubmissionOtherResponsiblePartiesSection";
import { SubmissionPrivacyOutcomeSummary } from "@/components/campaigns/submission/SubmissionPrivacyOutcomeSummary";
import { SubmissionSampleMessagesSection } from "@/components/campaigns/submission/SubmissionSampleMessagesSection";
import { SubmissionSampleMultimediaSection } from "@/components/campaigns/submission/SubmissionSampleMultimediaSection";
import { ValidationAlertList } from "@/components/common/ValidationAlertList";
import { getApiErrorMessage } from "@/config/apiClient";
import type {
  Campaign,
  CampaignSubmission,
  ContentAttributes,
  SubmissionValidationResult,
} from "@/types/campaign";
import type { CampaignGateResult } from "@/types/campaignGate";
import type { SampleMultimediaConfirmation } from "@/types/sampleMultimedia";
import { resolveCtaAssignment } from "@/types/privacyOutcome";
import type { CtaEditableParts } from "@/utils/ctaMessageFlow";
import {
  composeSubmissionCtaMessageFlow,
  parseCtaMessageFlow,
} from "@/utils/ctaMessageFlow";
import { buildHardToFindPrivacyAccessGuide } from "@/utils/hardToFindPrivacyGuide";
import { buildSubmissionContentDefaults } from "@/utils/submissionContentDefaults";
import { SAMPLE_MESSAGE_COUNT } from "@/utils/sampleMessageDefaults";
import {
  buildSampleMultimediaFilenames,
  mergeSampleMultimediaConfirmation,
} from "@/utils/sampleMultimedia";
import { isSubmissionFormComplete } from "@/utils/submissionFormValidity";

type Step = "edit" | "summary";

function isSubmissionSavedToServer(sub: CampaignSubmission): boolean {
  return Boolean(sub.campaignDescription?.trim() && sub.ctaMessageFlow?.trim());
}

/** Colapsa saltos de línea y espacios múltiples en una sola línea. */
function toSingleLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Garantiza un signo de puntuación final en el texto. */
function ensureTrailingPeriod(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

type SubmissionEditorFormState = {
  campaignDescription: string;
  ctaMessageFlow: string;
  optInDescription: string;
  optOutDescription: string;
  helpResponse: string;
  sampleMessages: [string, string];
  contentAttributes: ContentAttributes;
  estimatedSubscriberVolume: string;
  externalPortalReference: string;
  sampleMultimediaConfirmation: SampleMultimediaConfirmation | null;
};

function hasSubmissionFormChanges(
  submission: CampaignSubmission,
  form: SubmissionEditorFormState,
  privacyReviewId: string | undefined,
): boolean {
  if (form.campaignDescription !== (submission.campaignDescription ?? "")) {
    return true;
  }
  if (form.ctaMessageFlow !== (submission.ctaMessageFlow ?? "")) {
    return true;
  }
  if (form.optInDescription !== (submission.optInDescription ?? "")) {
    return true;
  }
  if (form.optOutDescription !== (submission.optOutDescription ?? "")) {
    return true;
  }
  if (form.helpResponse !== (submission.helpResponse ?? "")) {
    return true;
  }
  if (
    form.estimatedSubscriberVolume !==
    (submission.estimatedSubscriberVolume ?? "")
  ) {
    return true;
  }
  if (
    form.externalPortalReference !==
    (submission.externalPortalReference ?? "")
  ) {
    return true;
  }
  if (privacyReviewId !== (submission.privacyReviewId ?? undefined)) {
    return true;
  }

  const savedSamples = submission.sampleMessages ?? [];
  if (form.sampleMessages[0] !== (savedSamples[0] ?? "")) {
    return true;
  }
  if (form.sampleMessages[1] !== (savedSamples[1] ?? "")) {
    return true;
  }

  const savedAttrs = { ...emptyAttrs, ...submission.contentAttributes };
  if (JSON.stringify(form.contentAttributes) !== JSON.stringify(savedAttrs)) {
    return true;
  }

  return (
    JSON.stringify(form.sampleMultimediaConfirmation) !==
    JSON.stringify(submission.sampleMultimediaConfirmation ?? null)
  );
}

function submissionStatusChipLabel(status: SubmissionStatus): string {
  if (status === "SUBMITTED") return "Registrada en TCR";
  if (status === "REJECTED") return "Registro rechazado en TCR";
  if (status === "APPROVED") return "Aprobada en TCR";
  return status;
}

function submissionStatusChipColor(
  status: SubmissionStatus,
): "success" | "error" | "warning" | "default" {
  if (status === "SUBMITTED" || status === "APPROVED") return "success";
  if (status === "REJECTED") return "error";
  if (status === "READY") return "warning";
  return "default";
}

const EDITABLE_SUBMISSION_STATUSES: SubmissionStatus[] = [
  "DRAFT",
  "READY",
  "SUBMITTED",
  "REJECTED",
  "APPROVED",
];

const emptyAttrs: ContentAttributes = {
  embeddedLinks: false,
  phoneNumbers: false,
  ageGated: false,
  affiliateMarketing: false,
};

export function SubmissionEditorPage() {
  const { campaignId, submissionId } = useParams<{
    campaignId: string;
    submissionId: string;
  }>();

  const [submission, setSubmission] = useState<CampaignSubmission | null>(null);
  const [currentPrivacy, setCurrentPrivacy] = useState<Awaited<
    ReturnType<typeof fetchCurrentPrivacyReview>
  > | null>(null);
  const [linkedPrivacy, setLinkedPrivacy] = useState<Awaited<
    ReturnType<typeof fetchPrivacyReview>
  > | null>(null);
  const [gate, setGate] = useState<CampaignGateResult | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [step, setStep] = useState<Step>("edit");
  const [returnedFromSummary, setReturnedFromSummary] = useState(false);

  const [form, setForm] = useState({
    campaignDescription: "",
    ctaMessageFlow: "",
    ctaEditableParts: {
      leadMagnetUrl: "",
      optInKeyword: "",
      privacyPolicyExcerpt: "",
      hardToFindPrivacyGuide: "",
    } as CtaEditableParts,
    optInDescription: "",
    optOutDescription: "",
    helpResponse: "",
    sampleMessages: ["", ""] as [string, string],
    contentAttributes: { ...emptyAttrs },
    estimatedSubscriberVolume: "",
    externalPortalReference: "",
    sampleMultimediaConfirmation: null as SampleMultimediaConfirmation | null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [markingSubmitted, setMarkingSubmitted] = useState(false);
  const [updatingTcrOutcome, setUpdatingTcrOutcome] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validation, setValidation] = useState<SubmissionValidationResult | null>(
    null,
  );

  const load = useCallback(async () => {
    if (!submissionId || !campaignId) return;
    try {
      setLoading(true);
      const [sub, camp] = await Promise.all([
        fetchSubmission(submissionId),
        fetchCampaign(campaignId),
      ]);
      setSubmission(sub);
      setBrandId(camp.brandId);
      setCampaign(camp);
      setReturnedFromSummary(false);
      setSuccess(null);

      const [current, linked, gateResult] = await Promise.all([
        fetchCurrentPrivacyReview(camp.brandId),
        sub.privacyReviewId
          ? fetchPrivacyReview(sub.privacyReviewId)
          : Promise.resolve(null),
        fetchCampaignGate(camp.brandId),
      ]);
      setCurrentPrivacy(current);
      setLinkedPrivacy(linked);
      setGate(gateResult);

      const ctaAssignment = resolveCtaAssignment(
        gateResult.operationalOutcome,
        current?.policyLanguages ?? [],
      );
      const defaults = buildSubmissionContentDefaults(
        sub.brandSnapshot,
        ctaAssignment.templateKey,
        {
          operationalOutcome: gateResult.operationalOutcome,
        },
      );

      const hasCampaignDescription = Boolean(sub.campaignDescription?.trim());
      const hasCta = Boolean(sub.ctaMessageFlow?.trim());
      const hasOptIn = Boolean(sub.optInDescription?.trim());
      const hasOptOut = Boolean(sub.optOutDescription?.trim());
      const hasHelp = Boolean(sub.helpResponse?.trim());
      const filledSamples = sub.sampleMessages.filter((s) => s.trim());
      const sampleMessages: [string, string] =
        filledSamples.length >= SAMPLE_MESSAGE_COUNT
          ? [filledSamples[0], filledSamples[1]]
          : defaults.sampleMessages;

      let ctaEditableParts = hasCta
        ? parseCtaMessageFlow(
            sub.ctaMessageFlow ?? "",
            ctaAssignment.templateKey,
            sub.brandSnapshot,
          )
        : defaults.ctaEditableParts;

      if (
        gateResult.operationalOutcome === "HARD_TO_FIND" &&
        !ctaEditableParts.hardToFindPrivacyGuide.trim()
      ) {
        ctaEditableParts = {
          ...ctaEditableParts,
          hardToFindPrivacyGuide: buildHardToFindPrivacyAccessGuide(
            sub.brandSnapshot,
            ctaEditableParts.optInKeyword,
          ),
        };
      }

      const templateKey = ctaAssignment.templateKey ?? "LW_CTA_SAMPLE_FLOW_3";
      const ctaMessageFlow = composeSubmissionCtaMessageFlow(
        templateKey,
        sub.brandSnapshot,
        ctaEditableParts,
        {
          operationalOutcome: gateResult.operationalOutcome,
        },
      );

      const requiredMultimediaFiles = buildSampleMultimediaFilenames(
        gateResult.operationalOutcome,
        ctaEditableParts.optInKeyword,
      );

      setForm({
        campaignDescription: toSingleLine(
          hasCampaignDescription
            ? (sub.campaignDescription ?? "")
            : defaults.campaignDescription,
        ),
        ctaMessageFlow,
        ctaEditableParts,
        optInDescription: toSingleLine(
          hasOptIn ? (sub.optInDescription ?? "") : defaults.optInDescription,
        ),
        optOutDescription: ensureTrailingPeriod(
          toSingleLine(
            hasOptOut
              ? (sub.optOutDescription ?? "")
              : defaults.optOutDescription,
          ),
        ),
        helpResponse: toSingleLine(
          hasHelp ? (sub.helpResponse ?? "") : defaults.helpResponse,
        ),
        sampleMessages,
        contentAttributes: { ...emptyAttrs, ...sub.contentAttributes },
        estimatedSubscriberVolume: sub.estimatedSubscriberVolume ?? "",
        externalPortalReference: sub.externalPortalReference ?? "",
        sampleMultimediaConfirmation: mergeSampleMultimediaConfirmation(
          requiredMultimediaFiles,
          sub.sampleMultimediaConfirmation,
        ),
      });
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [submissionId, campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  const editable = EDITABLE_SUBMISSION_STATUSES.includes(
    submission?.status ?? "DRAFT",
  );
  const isPreRegistration =
    submission?.status === "DRAFT" || submission?.status === "READY";

  const operationalOutcome = gate?.operationalOutcome ?? null;

  const canSave = isSubmissionFormComplete({
    campaignDescription: form.campaignDescription,
    ctaMessageFlow: form.ctaMessageFlow,
    leadMagnetUrl: form.ctaEditableParts.leadMagnetUrl,
    optInDescription: form.optInDescription,
    optOutDescription: form.optOutDescription,
    helpResponse: form.helpResponse,
    sampleMessages: form.sampleMessages,
    sampleMultimediaConfirmation: form.sampleMultimediaConfirmation,
    optInKeyword: form.ctaEditableParts.optInKeyword,
    gate,
    operationalOutcome,
    defaultOptOutKeyword: campaign?.defaultOptOutKeyword,
  });

  const summaryData = useMemo(() => {
    const privacyPolicyLink = currentPrivacy?.privacyPolicyUrl ?? "";
    return {
      useCase: campaign?.useCase ?? "MARKETING",
      brandDbaName: submission?.brandSnapshot.dbaName ?? "",
      campaignDescription: form.campaignDescription,
      ctaMessageFlow: toSingleLine(form.ctaMessageFlow),
      privacyPolicyLink,
      sampleMessage1: form.sampleMessages[0] ?? "",
      sampleMessage2: form.sampleMessages[1] ?? "",
      subscriberOptIn: form.optInDescription,
      subscriberOptOut: form.optOutDescription,
      subscriberHelp: form.helpResponse,
      connectivityPartner: "Sinch - Inteliquent, Inc.",
      reseller: "No Reseller",
    };
  }, [campaign, submission, form, currentPrivacy]);

  const updateSample = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.sampleMessages];
      next[index] = value;
      return { ...prev, sampleMessages: next as [string, string] };
    });
  };

  const buildPayload = () => ({
    campaignDescription: form.campaignDescription,
    ctaMessageFlow: form.ctaMessageFlow || undefined,
    optInDescription: form.optInDescription,
    optOutDescription: form.optOutDescription,
    helpResponse: form.helpResponse,
    sampleMessages: form.sampleMessages.slice(0, SAMPLE_MESSAGE_COUNT),
    contentAttributes: form.contentAttributes,
    estimatedSubscriberVolume: form.estimatedSubscriberVolume || undefined,
    externalPortalReference: form.externalPortalReference || undefined,
    sampleMultimediaConfirmation: form.sampleMultimediaConfirmation,
    privacyReviewId: currentPrivacy?.id,
  });

  const handleSaveAndGoToSummary = async () => {
    if (!submissionId || !canSave) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await updateSubmission(submissionId, buildPayload());
      setSubmission(updated);
      setValidation(null);
      setStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!submissionId || !submission) return;

    const hasChanges = hasSubmissionFormChanges(
      submission,
      form,
      currentPrivacy?.id,
    );

    if (hasChanges && !canSave) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (hasChanges) {
        const updated = await updateSubmission(submissionId, buildPayload());
        setSubmission(updated);
        setValidation(null);
        setSuccess("Campaña actualizada correctamente.");
      } else {
        setSuccess("No hay cambios que guardar.");
      }

      setReturnedFromSummary(false);
      setStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!submissionId) return;
    try {
      setValidating(true);
      if (editable && canSave) {
        await updateSubmission(submissionId, buildPayload());
      }
      const result = await validateSubmission(submissionId);
      setValidation(result);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setValidating(false);
    }
  };

  const handleMarkSubmitted = async () => {
    if (!submissionId || !canSave) return;
    try {
      setMarkingSubmitted(true);
      setError(null);
      if (editable) {
        await updateSubmission(submissionId, buildPayload());
      }
      const updated = await markSubmissionSubmitted(submissionId);
      setSubmission(updated);
      setValidation({ valid: true, blocking: [], warnings: [] });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const data = err.response.data as SubmissionValidationResult;
        if (typeof data.valid === "boolean") {
          setValidation(data);
          setError("El envío tiene errores bloqueantes");
          return;
        }
      }
      setError(getApiErrorMessage(err));
    } finally {
      setMarkingSubmitted(false);
    }
  };

  const handleMarkRejected = async () => {
    if (!submissionId) return;
    try {
      setUpdatingTcrOutcome(true);
      setError(null);
      setSuccess(null);
      const updated = await markSubmissionRejected(submissionId);
      setSubmission(updated);
      setSuccess(
        "Registro rechazado en Campaign Registry. Debe presentarse la apelación.",
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingTcrOutcome(false);
    }
  };

  const handleMarkApproved = async () => {
    if (!submissionId) return;
    try {
      setUpdatingTcrOutcome(true);
      setError(null);
      setSuccess(null);
      const updated = await markSubmissionApproved(submissionId);
      setSubmission(updated);
      setSuccess("Campaña aprobada en Campaign Registry.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingTcrOutcome(false);
    }
  };

  const goToSummary = () => {
    setStep("summary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!submission || !campaign || !gate) {
    return <Alert severity="error">{error ?? "Envío no encontrado"}</Alert>;
  }

  const submissionStatus = submission.status;
  const isRegisteredInTcr =
    submissionStatus === "SUBMITTED" ||
    submissionStatus === "REJECTED" ||
    submissionStatus === "APPROVED";
  const hasPendingChanges = hasSubmissionFormChanges(
    submission,
    form,
    currentPrivacy?.id,
  );
  const submissionPersisted = isSubmissionSavedToServer(submission);
  const canMarkSubmitted =
    submissionPersisted &&
    step === "summary" &&
    isPreRegistration &&
    canSave;

  return (
    <Box maxWidth={900}>
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          top: 16,
          zIndex: 10,
          p: 2,
          mb: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={2}
        >
          <Box minWidth={0}>
            <Typography variant="h5">
              {step === "summary"
                ? "Resumen para Campaign Registry"
                : `Envío #${submission.submissionNumber}`}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
              <Chip
                label={submissionStatusChipLabel(submissionStatus)}
                size="small"
                color={submissionStatusChipColor(submissionStatus)}
              />
            </Box>
            {step === "summary" && isPreRegistration && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Copia cada valor en{" "}
                <a
                  href="https://csp.campaignregistry.com/campaign/create"
                  target="_blank"
                  rel="noreferrer"
                >
                  Campaign Registry
                </a>{" "}
                y, cuando hayas registrado la campaña, usa «Marcar enviado».
              </Typography>
            )}
            {step === "summary" && isRegisteredInTcr && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Puedes volver a editar el contenido o actualizar el estado según
                la respuesta en{" "}
                <a
                  href="https://csp.campaignregistry.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Campaign Registry
                </a>
                .
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            {step === "edit" && (
              <>
                {editable && returnedFromSummary && (
                  <Button
                    variant="contained"
                    onClick={() => void handleUpdate()}
                    disabled={saving || (hasPendingChanges && !canSave)}
                  >
                    {saving ? "Actualizando..." : "ACTUALIZAR"}
                  </Button>
                )}
                {editable && !returnedFromSummary && isPreRegistration && (
                  <Button
                    variant="contained"
                    onClick={() => void handleSaveAndGoToSummary()}
                    disabled={saving || !canSave}
                  >
                    {saving ? "Guardando..." : "Guardar y ver resumen"}
                  </Button>
                )}
                {editable && returnedFromSummary && (
                  <Button
                    variant="outlined"
                    onClick={() => void handleValidate()}
                    disabled={validating}
                  >
                    {validating ? "Validando..." : "VALIDAR"}
                  </Button>
                )}
                {editable && !returnedFromSummary && isPreRegistration && (
                  <Button
                    variant="outlined"
                    onClick={() => void handleValidate()}
                    disabled={validating}
                  >
                    {validating ? "Validando..." : "Validar"}
                  </Button>
                )}
                {editable && isRegisteredInTcr && !returnedFromSummary && (
                  <Button variant="outlined" onClick={goToSummary}>
                    Ver resumen
                  </Button>
                )}
              </>
            )}

            {step === "summary" && (
              <>
                {canMarkSubmitted && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => void handleMarkSubmitted()}
                    disabled={markingSubmitted}
                  >
                    {markingSubmitted ? "Marcando..." : "Marcar enviado"}
                  </Button>
                )}
                {submissionStatus === "SUBMITTED" && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => void handleMarkRejected()}
                    disabled={updatingTcrOutcome}
                  >
                    {updatingTcrOutcome ? "Actualizando..." : "REGISTRO RECHAZADO"}
                  </Button>
                )}
                {submissionStatus === "REJECTED" && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => void handleMarkApproved()}
                    disabled={updatingTcrOutcome}
                  >
                    {updatingTcrOutcome ? "Actualizando..." : "APROBADO"}
                  </Button>
                )}
                {editable && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setReturnedFromSummary(true);
                      setSuccess(null);
                      setStep("edit");
                    }}
                  >
                    Volver a editar
                  </Button>
                )}
              </>
            )}

            <Button
              component={RouterLink}
              to={brandId ? `/brands/${brandId}` : "/brands"}
              variant="outlined"
            >
              {step === "edit" && returnedFromSummary
                ? "VOLVER A MARCA"
                : "Volver a marca"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {submissionStatus === "SUBMITTED" && !success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Esta campaña ya fue registrada en Campaign Registry.
        </Alert>
      )}

      {submissionStatus === "REJECTED" && !success && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          El registro fue rechazado en Campaign Registry. Debe presentarse la
          apelación.
        </Alert>
      )}

      {submissionStatus === "APPROVED" && !success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Esta campaña fue aprobada en Campaign Registry.
        </Alert>
      )}

      {brandId && <CampaignCreationGateAlert gate={gate} brandId={brandId} />}

      {linkedPrivacy && linkedPrivacy.id !== currentPrivacy?.id && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Privacy review asociada #{linkedPrivacy.reviewNumber} no es la vigente.
          El outcome y CTA se basan en la review vigente.
        </Alert>
      )}

      {validation && (
        <Box mb={2}>
          {validation.valid && (
            <Alert severity="success" sx={{ mb: 1 }}>
              Sin errores bloqueantes
            </Alert>
          )}
          <ValidationAlertList
            blocking={validation.blocking}
            warnings={validation.warnings}
          />
        </Box>
      )}

      {step === "summary" ? (
        <TcrCampaignRegistrationSummary data={summaryData} />
      ) : (
        <>
          <SubmissionPrivacyOutcomeSummary
            privacyReview={currentPrivacy}
            brandId={brandId}
          />

          <SubmissionCampaignDetailsSection
            campaign={campaign}
            brandSnapshot={submission.brandSnapshot}
            privacyReview={currentPrivacy}
            campaignDescription={form.campaignDescription}
            ctaEditableParts={form.ctaEditableParts}
            privacyPolicyLink={currentPrivacy?.privacyPolicyUrl ?? ""}
            editable={editable}
            onCampaignDescriptionChange={(value) =>
              setForm((p) => ({ ...p, campaignDescription: value }))
            }
            onCtaEditablePartsChange={(parts, composed) =>
              setForm((p) => {
                const requiredFiles = buildSampleMultimediaFilenames(
                  operationalOutcome,
                  parts.optInKeyword,
                );
                return {
                  ...p,
                  ctaEditableParts: parts,
                  ctaMessageFlow: composed,
                  sampleMultimediaConfirmation: mergeSampleMultimediaConfirmation(
                    requiredFiles,
                    p.sampleMultimediaConfirmation,
                  ),
                };
              })
            }
          />

          <SubmissionSampleMessagesSection
            sampleMessages={form.sampleMessages}
            operationalOutcome={operationalOutcome}
            editable={editable}
            onUpdateSample={updateSample}
          />

          <SubmissionOptInOutHelpSection
            operationalOutcome={operationalOutcome}
            optInDescription={form.optInDescription}
            optOutDescription={form.optOutDescription}
            helpResponse={form.helpResponse}
            editable={editable}
            onOptInChange={(value) =>
              setForm((p) => ({ ...p, optInDescription: value }))
            }
            onOptOutChange={(value) =>
              setForm((p) => ({ ...p, optOutDescription: value }))
            }
            onHelpChange={(value) =>
              setForm((p) => ({ ...p, helpResponse: value }))
            }
          />

          <SubmissionSampleMultimediaSection
            operationalOutcome={operationalOutcome}
            optInKeyword={form.ctaEditableParts.optInKeyword}
            confirmation={form.sampleMultimediaConfirmation}
            editable={editable}
            onChange={(sampleMultimediaConfirmation) =>
              setForm((p) => ({ ...p, sampleMultimediaConfirmation }))
            }
          />

          <SubmissionOtherResponsiblePartiesSection />
        </>
      )}
    </Box>
  );
}
