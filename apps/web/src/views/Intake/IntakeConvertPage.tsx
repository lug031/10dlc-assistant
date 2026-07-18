import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import { convertIntakeToBrand, fetchIntakeRequest } from "@/api/intake";
import { fetchBrand } from "@/api/brands";
import { TcrBrandRegistrationForm } from "@/components/brands/TcrBrandRegistrationForm";
import { TcrBrandRegistrationSummary } from "@/components/brands/TcrBrandRegistrationSummary";
import {
  type TcrBrandFormState,
  toBrandCreatePayload,
  toTcrBrandSummaryData,
} from "@/components/brands/tcrBrandForm";
import { getApiErrorMessage } from "@/config/apiClient";
import type { BrandRegistrationCountry } from "@/constants/brand";

type Step = "form" | "summary";

function brandToForm(brand: {
  legalName: string;
  dbaName: string | null;
  einOrTaxId: string;
  registrationCountry: string;
  taxIdIssuingCountry: string;
  legalAddressLine1: string;
  legalAddressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  supportPhoneNumber: string;
  supportEmailAddress: string;
  websiteUrl: string | null;
}): TcrBrandFormState {
  return {
    legalName: brand.legalName,
    dbaName: brand.dbaName ?? "",
    einOrTaxId: brand.einOrTaxId,
    registrationCountry: brand.registrationCountry as BrandRegistrationCountry,
    taxIdIssuingCountry: brand.taxIdIssuingCountry as BrandRegistrationCountry,
    legalAddressLine1: [brand.legalAddressLine1, brand.legalAddressLine2]
      .filter(Boolean)
      .join(", "),
    city: brand.city,
    state: brand.state,
    postalCode: brand.postalCode,
    supportPhoneNumber: brand.supportPhoneNumber,
    supportEmailAddress: brand.supportEmailAddress,
    websiteUrl: brand.websiteUrl ?? "",
  };
}

export function IntakeConvertPage() {
  const { intakeId } = useParams<{ intakeId: string }>();
  const [form, setForm] = useState<TcrBrandFormState | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const [createdBrandId, setCreatedBrandId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!intakeId) return;
    try {
      setLoading(true);
      const intake = await fetchIntakeRequest(intakeId);
      setBrandName(intake.brandName);

      if (intake.status === "CONVERTED" && intake.convertedBrandId) {
        const brand = await fetchBrand(intake.convertedBrandId);
        setForm(brandToForm(brand));
        setCreatedBrandId(brand.id);
        setStep("summary");
        setError(null);
        return;
      }

      if (intake.status !== "RESPONDED") {
        setError(
          "Solo puedes crear la marca cuando el intake fue marcado como respondido.",
        );
        setForm(null);
        return;
      }
      setCreatedBrandId(null);
      setForm({
        legalName: "",
        dbaName: intake.brandName,
        einOrTaxId: "",
        registrationCountry: "United States",
        taxIdIssuingCountry: "United States",
        legalAddressLine1: "",
        city: "",
        state: "",
        postalCode: "",
        supportPhoneNumber: "",
        supportEmailAddress: "",
        websiteUrl: "",
      });
      setStep("form");
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [intakeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const summaryData = useMemo(
    () => (form ? toTcrBrandSummaryData(form) : null),
    [form],
  );

  const update = (field: keyof TcrBrandFormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    setError(null);
  };

  const handleSaveAndGoToSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeId || !form) return;

    const formEl = e.currentTarget as HTMLFormElement;
    if (!formEl.reportValidity()) return;

    if (createdBrandId) {
      setStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const result = await convertIntakeToBrand(
        intakeId,
        toBrandCreatePayload(form),
      );
      setCreatedBrandId(result.brand.id);
      setStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form || !summaryData) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? "Intake no encontrado"}
        </Alert>
        <Button component={RouterLink} to="/intake" variant="outlined">
          Volver
        </Button>
      </Box>
    );
  }

  if (step === "summary") {
    return (
      <Box maxWidth={960}>
        <Typography variant="h4" gutterBottom>
          Resumen para Campaign Registry
        </Typography>
        <Typography color="text.secondary" paragraph>
          La marca ya fue guardada en la app. Copia cada valor en el formulario
          de marca de{" "}
          <a
            href="https://csp.campaignregistry.com/"
            target="_blank"
            rel="noreferrer"
          >
            Campaign Registry
          </a>
          .
        </Typography>

        <Alert severity="success" sx={{ mb: 2 }}>
          Marca creada correctamente.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TcrBrandRegistrationSummary data={summaryData} />

        <Box display="flex" gap={2} mt={3} flexWrap="wrap">
          {createdBrandId && (
            <Button
              component={RouterLink}
              to={`/brands/${createdBrandId}`}
              variant="contained"
            >
              Ver marca
            </Button>
          )}
          {createdBrandId && (
            <Button
              component={RouterLink}
              to={`/brands/${createdBrandId}/edit`}
              variant="outlined"
            >
              Editar marca
            </Button>
          )}
          <Button
            component={RouterLink}
            to={`/intake/${intakeId}`}
            variant="outlined"
          >
            Volver al intake
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSaveAndGoToSummary} maxWidth={960}>
      <Typography variant="h4" gutterBottom>
        Crear marca
      </Typography>
      <Typography color="text.secondary" paragraph>
        Ingresa los datos que recibiste del contacto para {brandName}. Al
        guardar se crea la marca en la app y veras un resumen listo para copiar
        en Campaign Registry.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TcrBrandRegistrationForm
        form={form}
        onChange={update}
        supportEmailHelperText="Correo de soporte de la marca (no es el contacto del intake)"
      />

      <Box display="flex" gap={2} mt={3} flexWrap="wrap">
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Guardando..." : "GUARDAR Y VER RESUMEN"}
        </Button>
        <Button
          component={RouterLink}
          to={`/intake/${intakeId}`}
          variant="outlined"
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
