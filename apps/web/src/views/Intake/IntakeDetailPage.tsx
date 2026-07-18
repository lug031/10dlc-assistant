import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  fetchIntakeRequest,
  generateIntakeEmail,
  markIntakeResponded,
  markIntakeSent,
  updateIntakeRequest,
} from "@/api/intake";
import { IntakeEmailPanel } from "@/components/intake/IntakeEmailPanel";
import { getApiErrorMessage } from "@/config/apiClient";
import type { IntakeRequest } from "@/types/intake";
import { INTAKE_STATUS_LABELS } from "@/types/intake";

type IntakeFormState = {
  brandName: string;
  contactName: string;
  contactEmail: string;
};

function toFormState(intake: IntakeRequest): IntakeFormState {
  return {
    brandName: intake.brandName,
    contactName: intake.contactName,
    contactEmail: intake.contactEmail,
  };
}

export function IntakeDetailPage() {
  const { intakeId } = useParams<{ intakeId: string }>();
  const [intake, setIntake] = useState<IntakeRequest | null>(null);
  const [form, setForm] = useState<IntakeFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!intakeId) return;
    try {
      setLoading(true);
      const data = await fetchIntakeRequest(intakeId);
      setIntake(data);
      setForm(toFormState(data));
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setIntake(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [intakeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (action: () => Promise<IntakeRequest>) => {
    try {
      setActing(true);
      setError(null);
      setSuccess(null);
      const updated = await action();
      setIntake(updated);
      setForm(toFormState(updated));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const updateForm = (field: keyof IntakeFormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intake || !form) return;

    try {
      setActing(true);
      setError(null);
      setSuccess(null);
      const updated = await updateIntakeRequest(intake.id, {
        brandName: form.brandName,
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail,
      });
      const withEmail = await generateIntakeEmail(updated.id);
      setIntake(withEmail);
      setForm(toFormState(withEmail));
      setSuccess("Cambios guardados y correo actualizado.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!intake || !form) {
    return <Alert severity="error">{error ?? "Intake no encontrado"}</Alert>;
  }

  const canCreateBrand = intake.status === "RESPONDED";
  const isClosed =
    intake.status === "CONVERTED" || intake.status === "CANCELLED";

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
            <Typography variant="h5" noWrap>
              {intake.brandName}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center" mt={0.5}>
              <Chip
                size="small"
                label={INTAKE_STATUS_LABELS[intake.status]}
                color="primary"
              />
              <Typography variant="body2" color="text.secondary" noWrap>
                {intake.contactName
                  ? `${intake.contactName} — ${intake.contactEmail}`
                  : intake.contactEmail}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            {!isClosed && intake.status === "DRAFT" && (
              <Button
                variant="contained"
                disabled={acting}
                onClick={() => void runAction(() => markIntakeSent(intake.id))}
              >
                Marcar como enviado
              </Button>
            )}
            {!isClosed && intake.status === "SENT" && (
              <Button
                variant="contained"
                color="secondary"
                disabled={acting}
                onClick={() =>
                  void runAction(() => markIntakeResponded(intake.id))
                }
              >
                Marcar como respondido
              </Button>
            )}
            {canCreateBrand && (
              <Button
                component={RouterLink}
                to={`/intake/${intake.id}/convert`}
                variant="contained"
                color="success"
              >
                Crear marca
              </Button>
            )}
            {intake.status === "CONVERTED" && intake.convertedBrandId && (
              <Button
                component={RouterLink}
                to={`/brands/${intake.convertedBrandId}`}
                variant="contained"
              >
                Ver marca creada
              </Button>
            )}
            <Button component={RouterLink} to="/intake" variant="outlined">
              Volver
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

      <IntakeEmailPanel
        brandName={form.brandName}
        contactName={form.contactName}
        contactEmail={form.contactEmail}
      />

      <Accordion
        key={intake.id}
        defaultExpanded={false}
        disableGutters
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          "&::before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box>
            <Typography fontWeight={600}>Datos del intake</Typography>
            <Typography variant="body2" color="text.secondary">
              Marca y contacto. Al guardar se actualiza el correo.
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {isClosed ? (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>
                <strong>Brand Name:</strong> {intake.brandName}
              </Typography>
              {intake.contactName && (
                <Typography>
                  <strong>Contact Name:</strong> {intake.contactName}
                </Typography>
              )}
              <Typography>
                <strong>Contact Email:</strong> {intake.contactEmail}
              </Typography>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSave}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <TextField
                required
                label="Brand Name"
                value={form.brandName}
                onChange={(e) => updateForm("brandName", e.target.value)}
              />
              <TextField
                label="Contact Name"
                value={form.contactName}
                onChange={(e) => updateForm("contactName", e.target.value)}
              />
              <TextField
                required
                type="email"
                label="Contact Email"
                value={form.contactEmail}
                onChange={(e) => updateForm("contactEmail", e.target.value)}
              />
              <Box>
                <Button type="submit" variant="outlined" disabled={acting}>
                  {acting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Typography variant="caption" color="text.secondary" display="block" mt={2}>
        Creado: {new Date(intake.createdAt).toLocaleString()}
        {intake.requestedAt &&
          ` — Solicitado: ${new Date(intake.requestedAt).toLocaleString()}`}
      </Typography>
    </Box>
  );
}
