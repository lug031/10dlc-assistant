import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useNavigate } from "react-router";
import { createIntakeRequest, generateIntakeEmail } from "@/api/intake";
import { getApiErrorMessage } from "@/config/apiClient";

export function IntakeCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    brandName: "",
    contactName: "",
    contactEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const intake = await createIntakeRequest({
        brandName: form.brandName,
        contactName: form.contactName.trim() || undefined,
        contactEmail: form.contactEmail,
      });
      await generateIntakeEmail(intake.id);
      navigate(`/intake/${intake.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={640}>
      <Typography variant="h4" gutterBottom>
        Nuevo Intake
      </Typography>
      <Typography color="text.secondary" paragraph>
        Solo necesitas el nombre de la marca y el contacto. Generaremos el
        correo para solicitar la informacion del registro 10DLC.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          required
          label="Brand Name"
          value={form.brandName}
          onChange={(e) => update("brandName", e.target.value)}
        />
        <TextField
          label="Contact Name"
          value={form.contactName}
          onChange={(e) => update("contactName", e.target.value)}
        />
        <TextField
          required
          type="email"
          label="Contact Email"
          value={form.contactEmail}
          onChange={(e) => update("contactEmail", e.target.value)}
        />
        <Box display="flex" gap={2}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Generando..." : "Generar Solicitud"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/intake")}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
