import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { OperationalOutcome } from "@/types/privacy";

interface SubmissionMultimediaGuidanceSectionProps {
  operationalOutcome: OperationalOutcome | null | undefined;
}

export function SubmissionMultimediaGuidanceSection({
  operationalOutcome,
}: SubmissionMultimediaGuidanceSectionProps) {
  if (!operationalOutcome || operationalOutcome === "NO_POLICY") {
    return null;
  }

  const hardToFind = operationalOutcome === "HARD_TO_FIND";

  const items = hardToFind
    ? [
        "Adjuntar screenshots del Lead Magnet.",
        "Adjuntar screenshots del QR Code (si aplica).",
        "Adjuntar screenshots mostrando cómo acceder a la Política de Privacidad.",
        "Adjuntar evidencia utilizada para evitar rechazos TCR.",
        "Verificar que los screenshots serán cargados manualmente en Campaign Registry.",
      ]
    : [
        "Adjuntar screenshots del Lead Magnet si aplica.",
        "Adjuntar screenshots del QR si aplica.",
        "Verificar evidencia antes del registro en Campaign Registry.",
      ];

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sample Multimedia Guidance
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Los screenshots no se almacenan en 10DLC Assistant. Se cargan
        manualmente durante el registro en Campaign Registry (
        <Typography
          component="a"
          href="https://csp.campaignregistry.com/campaign/create"
          target="_blank"
          rel="noreferrer"
          variant="body2"
        >
          csp.campaignregistry.com/campaign/create
        </Typography>
        ).
      </Alert>

      <List dense>
        {items.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
