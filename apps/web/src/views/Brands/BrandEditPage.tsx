import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import { fetchBrand, updateBrand } from "@/api/brands";
import { TcrBrandRegistrationForm } from "@/components/brands/TcrBrandRegistrationForm";
import { TcrBrandRegistrationSummary } from "@/components/brands/TcrBrandRegistrationSummary";
import {
  type TcrBrandFormState,
  toBrandUpdatePayload,
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

export function BrandEditPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [form, setForm] = useState<TcrBrandFormState | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!brandId) return;
    try {
      setLoading(true);
      const brand = await fetchBrand(brandId);
      setForm(brandToForm(brand));
      setStep("form");
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

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

  const handleUpdateAndGoToSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId || !form) return;

    const formEl = e.currentTarget as HTMLFormElement;
    if (!formEl.reportValidity()) return;

    try {
      setSubmitting(true);
      setError(null);
      await updateBrand(brandId, toBrandUpdatePayload(form));
      setStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (error && !form) {
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

  if (!form || !summaryData) {
    return null;
  }

  if (step === "summary") {
    return (
      <Box maxWidth={960}>
        <Typography variant="h4" gutterBottom>
          Resumen para Campaign Registry
        </Typography>
        <Typography color="text.secondary" paragraph>
          Los cambios ya fueron guardados en la app. Copia cada valor en el
          formulario de marca de{" "}
          <a
            href="https://csp.campaignregistry.com/"
            target="_blank"
            rel="noreferrer"
          >
            Campaign Registry
          </a>
          .
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TcrBrandRegistrationSummary data={summaryData} />

        <Box display="flex" gap={2} mt={3} flexWrap="wrap">
          <Button
            variant="outlined"
            onClick={() => {
              setStep("form");
              setError(null);
            }}
          >
            Volver a editar
          </Button>
          <Button
            component={RouterLink}
            to={`/brands/${brandId}`}
            variant="outlined"
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleUpdateAndGoToSummary} maxWidth={960}>
      <Typography variant="h4" gutterBottom>
        Editar marca
      </Typography>
      <Typography color="text.secondary" paragraph>
        Actualiza los datos legales de la marca. Al actualizar se guardan los
        cambios y veras un resumen listo para copiar en Campaign Registry.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TcrBrandRegistrationForm form={form} onChange={update} />

      <Box display="flex" gap={2} mt={3} flexWrap="wrap">
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? "Actualizando..." : "ACTUALIZAR"}
        </Button>
        <Button
          component={RouterLink}
          to={`/brands/${brandId}`}
          variant="outlined"
          disabled={submitting}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
