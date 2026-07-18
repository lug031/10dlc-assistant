import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import { createBrand } from "@/api/brands";
import { TcrBrandRegistrationForm } from "@/components/brands/TcrBrandRegistrationForm";
import { TcrBrandRegistrationSummary } from "@/components/brands/TcrBrandRegistrationSummary";
import {
  emptyTcrBrandForm,
  type TcrBrandFormState,
  toBrandCreatePayload,
  toTcrBrandSummaryData,
} from "@/components/brands/tcrBrandForm";
import { getApiErrorMessage } from "@/config/apiClient";

type Step = "form" | "summary";

export function BrandCreatePage() {
  const [form, setForm] = useState<TcrBrandFormState>(emptyTcrBrandForm);
  const [step, setStep] = useState<Step>("form");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBrandId, setCreatedBrandId] = useState<string | null>(null);

  const summaryData = useMemo(() => toTcrBrandSummaryData(form), [form]);

  const update = (field: keyof TcrBrandFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSaveAndGoToSummary = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const brand = await createBrand(toBrandCreatePayload(form));
      setCreatedBrandId(brand.id);
      setStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

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
          <Button component={RouterLink} to="/brands" variant="outlined">
            Volver al listado
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
        Ingresa los datos legales de la marca. Al guardar se crea la marca en la
        app y veras un resumen listo para copiar en Campaign Registry.
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Si aun debes solicitar datos al cliente, usa{" "}
        <RouterLink to="/intake/new">Nuevo Intake</RouterLink>.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TcrBrandRegistrationForm form={form} onChange={update} />

      <Box display="flex" gap={2} mt={3} flexWrap="wrap">
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Guardando..." : "GUARDAR Y VER RESUMEN"}
        </Button>
        <Button component={RouterLink} to="/brands" variant="outlined">
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
