import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchBrand } from "@/api/brands";
import {
  createPrivacyReview,
  fetchPrivacyReview,
  updatePrivacyReview,
} from "@/api/privacy";
import { getApiErrorMessage } from "@/config/apiClient";
import {
  PRIVACY_ACCESSIBILITY_FORM_STATUSES,
  PRIVACY_ACCESSIBILITY_LABELS,
  PRIVACY_ACCESSIBILITY_GUIDANCE,
  PRIVACY_INACCESSIBLE_REASONS,
  PRIVACY_INACCESSIBLE_REASON_LABELS,
  PRIVACY_POLICY_LANGUAGES,
  PRIVACY_SCENARIO_FORM_TYPES,
  PRIVACY_SCENARIO_LABELS,
  type PrivacyPolicyLanguage,
  type PrivacyScenarioType,
  type PrivacyAccessibilityStatus,
} from "@/types/privacy";
import {
  OPERATIONAL_CASE_FORM_DESCRIPTIONS,
  OPERATIONAL_CASE_FORM_LABELS,
  accessibleCtaTemplateForLanguage,
  formCaseToOperationalOutcome,
  operationalOutcomeToFormCase,
  operationalCasesForAccessibility,
  isOperationalCaseAllowedForAccessibility,
  PRIVACY_POLICY_LANGUAGE_LABELS,
  type OperationalCaseFormType,
} from "@/types/privacyOutcome";

const steps = ["Escenario", "URLs", "Idioma", "Accesibilidad", "Caso operativo"];

const emptyForm = {
  scenarioType: "OWN_WEBSITE" as PrivacyScenarioType,
  privacyPolicyUrl: "",
  facebookPageUrl: "",
  externalHostingProvider: "",
  policyLanguages: ["EN"] as PrivacyPolicyLanguage[],
  accessibilityStatus: "" as "ACCESSIBLE" | "INACCESSIBLE" | "",
  inaccessibleReason: "" as string,
  inaccessibleReasonOther: "",
  operationalCase: "" as OperationalCaseFormType | "",
};

export function PrivacyFormPage() {
  const { brandId, reviewId } = useParams<{
    brandId: string;
    reviewId?: string;
  }>();
  const navigate = useNavigate();
  const isEdit = Boolean(reviewId);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) return;

    async function load() {
      try {
        setLoading(true);
        const brand = await fetchBrand(brandId!);
        setBrandName(brand.legalName);

        if (reviewId) {
          const review = await fetchPrivacyReview(reviewId);
          const operationalCase = operationalOutcomeToFormCase(
            review.operationalOutcome ?? "",
          );
          const accessibilityStatus =
            review.accessibilityStatus === "ACCESSIBLE" ||
            review.accessibilityStatus === "INACCESSIBLE"
              ? review.accessibilityStatus
              : operationalCase === "NO_POLICY"
                ? "INACCESSIBLE"
                : operationalCase
                  ? "ACCESSIBLE"
                  : "";
          setForm({
            scenarioType: review.scenarioType,
            privacyPolicyUrl: review.privacyPolicyUrl ?? "",
            facebookPageUrl: review.facebookPageUrl ?? "",
            externalHostingProvider: review.externalHostingProvider ?? "",
            policyLanguages: review.policyLanguages,
            accessibilityStatus,
            inaccessibleReason: review.inaccessibleReason ?? "",
            inaccessibleReasonOther:
              review.inaccessibleReason === "OTHER"
                ? (review.findings ?? "")
                : "",
            operationalCase: isOperationalCaseAllowedForAccessibility(
              accessibilityStatus,
              operationalCase,
            )
              ? operationalCase
              : "",
          });
        }
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [brandId, reviewId]);

  const update = (field: keyof typeof form, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const scenarioOptions =
    form.scenarioType === "COMBINED"
      ? ([...PRIVACY_SCENARIO_FORM_TYPES, "COMBINED"] as const)
      : PRIVACY_SCENARIO_FORM_TYPES;

  const needsPrivacyUrl =
    form.scenarioType === "OWN_WEBSITE" ||
    form.scenarioType === "EXTERNAL_HOSTING";

  const needsFacebookUrl = form.scenarioType === "FACEBOOK";

  const policyLanguage = form.policyLanguages[0] ?? "EN";

  const allowedOperationalCases = operationalCasesForAccessibility(
    form.accessibilityStatus,
  );

  const applyAccessibilityChange = (status: "ACCESSIBLE" | "INACCESSIBLE") => {
    setForm((prev) => {
      const allowed = operationalCasesForAccessibility(status);
      const operationalCase = allowed.includes(
        prev.operationalCase as OperationalCaseFormType,
      )
        ? prev.operationalCase
        : "";

      return {
        ...prev,
        accessibilityStatus: status,
        operationalCase,
        inaccessibleReason: status === "INACCESSIBLE" ? prev.inaccessibleReason : "",
        inaccessibleReasonOther:
          status === "INACCESSIBLE" ? prev.inaccessibleReasonOther : "",
      };
    });
    setError(null);
  };

  const buildPayload = () => {
    const payload: {
      scenarioType: PrivacyScenarioType;
      privacyPolicyUrl?: string;
      facebookPageUrl?: string;
      externalHostingProvider?: string;
      policyLanguages: PrivacyPolicyLanguage[];
      accessibilityStatus: PrivacyAccessibilityStatus;
      inaccessibleReason?: (typeof PRIVACY_INACCESSIBLE_REASONS)[number];
      findings?: string | null;
      operationalOutcome?: ReturnType<typeof formCaseToOperationalOutcome>;
    } = {
      scenarioType: form.scenarioType,
      privacyPolicyUrl: form.privacyPolicyUrl || undefined,
      facebookPageUrl: form.facebookPageUrl || undefined,
      externalHostingProvider: form.externalHostingProvider || undefined,
      policyLanguages: form.policyLanguages,
      accessibilityStatus: form.accessibilityStatus as PrivacyAccessibilityStatus,
      inaccessibleReason:
        form.accessibilityStatus === "INACCESSIBLE" && form.inaccessibleReason
          ? (form.inaccessibleReason as (typeof PRIVACY_INACCESSIBLE_REASONS)[number])
          : undefined,
      operationalOutcome: form.operationalCase
        ? formCaseToOperationalOutcome(form.operationalCase, policyLanguage)
        : undefined,
    };

    if (
      form.accessibilityStatus === "INACCESSIBLE" &&
      form.inaccessibleReason === "OTHER"
    ) {
      payload.findings = form.inaccessibleReasonOther.trim() || undefined;
    } else if (
      isEdit &&
      form.accessibilityStatus === "INACCESSIBLE" &&
      form.inaccessibleReason &&
      form.inaccessibleReason !== "OTHER"
    ) {
      payload.findings = null;
    }

    return payload;
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      if (!form.operationalCase) {
        setError("El caso operativo es obligatorio");
        return;
      }
      if (
        !isOperationalCaseAllowedForAccessibility(
          form.accessibilityStatus,
          form.operationalCase,
        )
      ) {
        setError("El caso operativo no coincide con la accesibilidad seleccionada");
        return;
      }
      void handleSubmit();
      return;
    }

    if (activeStep === 3) {
      if (
        form.accessibilityStatus !== "ACCESSIBLE" &&
        form.accessibilityStatus !== "INACCESSIBLE"
      ) {
        setError("Seleccione si la política es accesible o inaccesible");
        return;
      }
      if (form.accessibilityStatus === "INACCESSIBLE") {
        if (!form.inaccessibleReason) {
          setError("Seleccione por qué no es accesible");
          return;
        }
        if (
          form.inaccessibleReason === "OTHER" &&
          !form.inaccessibleReasonOther.trim()
        ) {
          setError("Indique el motivo en el campo Otro");
          return;
        }
      }
    }

    setError(null);
    setActiveStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!brandId) return;
    try {
      setSubmitting(true);
      setError(null);
      const payload = buildPayload();

      if (isEdit && reviewId) {
        await updatePrivacyReview(reviewId, payload);
        navigate(`/brands/${brandId}/privacy/${reviewId}`);
      } else {
        const review = await createPrivacyReview(brandId, payload);
        navigate(`/brands/${brandId}/privacy/${review.id}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={800}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? "Editar revision de privacidad" : "Nueva revision de privacidad"}
      </Typography>
      {brandName && (
        <Typography color="text.secondary" paragraph>
          {brandName}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <FormControl fullWidth>
          <InputLabel>Escenario de privacidad</InputLabel>
          <Select
            label="Escenario de privacidad"
            value={form.scenarioType}
            onChange={(e) =>
              update("scenarioType", e.target.value as PrivacyScenarioType)
            }
          >
            {scenarioOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {PRIVACY_SCENARIO_LABELS[type]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {activeStep === 1 && (
        <Box display="flex" flexDirection="column" gap={2}>
          {needsPrivacyUrl && (
            <TextField
              required
              label="URL de politica de privacidad"
              value={form.privacyPolicyUrl}
              onChange={(e) => update("privacyPolicyUrl", e.target.value)}
              fullWidth
            />
          )}
          {needsFacebookUrl && (
            <TextField
              required
              label="URL de pagina de Facebook"
              value={form.facebookPageUrl}
              onChange={(e) => update("facebookPageUrl", e.target.value)}
              fullWidth
            />
          )}
          {form.scenarioType === "EXTERNAL_HOSTING" && (
            <TextField
              label="Proveedor de hosting externo"
              value={form.externalHostingProvider}
              onChange={(e) =>
                update("externalHostingProvider", e.target.value)
              }
              fullWidth
              placeholder="GitHub Pages, Notion, etc."
            />
          )}
        </Box>
      )}

      {activeStep === 2 && (
        <Box display="flex" flexDirection="column" gap={2}>
          <FormControl component="fieldset" required>
            <FormLabel component="legend">Idioma de la politica</FormLabel>
            <RadioGroup
              row
              value={form.policyLanguages[0] ?? "EN"}
              onChange={(e) =>
                update("policyLanguages", [e.target.value as PrivacyPolicyLanguage])
              }
            >
              {PRIVACY_POLICY_LANGUAGES.map((lang) => (
                <FormControlLabel
                  key={lang}
                  value={lang}
                  control={<Radio />}
                  label={lang === "EN" ? "Ingles" : "Espanol"}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      )}

      {activeStep === 3 && (
        <Box display="flex" flexDirection="column" gap={2}>
          <FormControl fullWidth required>
            <InputLabel>¿La política es accesible públicamente?</InputLabel>
            <Select
              label="¿La política es accesible públicamente?"
              value={form.accessibilityStatus}
              onChange={(e) =>
                applyAccessibilityChange(
                  e.target.value as "ACCESSIBLE" | "INACCESSIBLE",
                )
              }
            >
              {PRIVACY_ACCESSIBILITY_FORM_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {PRIVACY_ACCESSIBILITY_LABELS[status]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {form.accessibilityStatus && (
            <Alert severity="info">
              {PRIVACY_ACCESSIBILITY_GUIDANCE[form.accessibilityStatus]}
            </Alert>
          )}
          {form.accessibilityStatus === "INACCESSIBLE" && (
            <>
              <FormControl fullWidth required>
                <InputLabel>¿Por qué no es accesible?</InputLabel>
                <Select
                  label="¿Por qué no es accesible?"
                  value={form.inaccessibleReason}
                  onChange={(e) => {
                    update("inaccessibleReason", e.target.value);
                    if (e.target.value !== "OTHER") {
                      update("inaccessibleReasonOther", "");
                    }
                  }}
                >
                  {PRIVACY_INACCESSIBLE_REASONS.map((reason) => (
                    <MenuItem key={reason} value={reason}>
                      {PRIVACY_INACCESSIBLE_REASON_LABELS[reason]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {form.inaccessibleReason === "OTHER" && (
                <TextField
                  required
                  label="Otro motivo"
                  value={form.inaccessibleReasonOther}
                  onChange={(e) =>
                    update("inaccessibleReasonOther", e.target.value)
                  }
                  fullWidth
                  multiline
                  minRows={2}
                />
              )}
            </>
          )}
        </Box>
      )}

      {activeStep === 4 && (
        <Box display="flex" flexDirection="column" gap={2}>
          <FormControl fullWidth required>
            <InputLabel>Caso operativo</InputLabel>
            <Select
              label="Caso operativo"
              value={form.operationalCase}
              onChange={(e) =>
                update(
                  "operationalCase",
                  e.target.value as OperationalCaseFormType,
                )
              }
            >
              {allowedOperationalCases.map((caseType) => (
                <MenuItem key={caseType} value={caseType}>
                  {OPERATIONAL_CASE_FORM_LABELS[caseType]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {form.operationalCase && (
            <Typography variant="body2" color="text.secondary">
              {OPERATIONAL_CASE_FORM_DESCRIPTIONS[form.operationalCase]}
            </Typography>
          )}
          {(form.operationalCase === "ACCESSIBLE" ||
            form.operationalCase === "HARD_TO_FIND") && (
            <Alert severity="info">
              Idioma de política:{" "}
              <strong>{PRIVACY_POLICY_LANGUAGE_LABELS[policyLanguage]}</strong>
              . CTA asignado:{" "}
              <strong>{accessibleCtaTemplateForLanguage(policyLanguage)}</strong>
            </Alert>
          )}
          {!form.operationalCase && (
            <Typography variant="body2" color="text.secondary">
              {form.accessibilityStatus === "ACCESSIBLE"
                ? "Elija CASO 2 o CASO 3 según corresponda."
                : form.accessibilityStatus === "INACCESSIBLE"
                  ? "Se aplica CASO 1 — sin política de privacidad."
                  : "Complete el paso de accesibilidad primero."}
            </Typography>
          )}
        </Box>
      )}

      <Box display="flex" gap={2} mt={3}>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep((s) => s - 1)}>
          Atras
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={submitting}>
          {activeStep === steps.length - 1
            ? submitting
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Crear revision"
            : "Siguiente"}
        </Button>
        <Button
          variant="text"
          onClick={() => navigate(`/brands/${brandId}/privacy`)}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
