import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { PENDING_LEADWIRE_TEXT } from "@/constants/leadwireCatalog";

interface LeadwireEmailPreviewProps {
  templateId: string;
  label: string;
  subject: string | null;
  body: string | null;
}

export function LeadwireEmailPreview({
  templateId,
  label,
  subject,
  body,
}: LeadwireEmailPreviewProps) {
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const pending = !body;

  const copy = async (text: string, kind: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar(`${kind} copiado`);
    } catch {
      setSnackbar("No se pudo copiar");
    }
  };

  if (pending) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={1} alignItems="center" mb={1} flexWrap="wrap">
          <Typography variant="subtitle1" fontWeight={600}>
            {label}
          </Typography>
          <Chip size="small" label={templateId} variant="outlined" />
        </Box>
        <Alert severity="info">{PENDING_LEADWIRE_TEXT}</Alert>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
        mb={2}
        flexWrap="wrap"
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {label}
          </Typography>
          <Chip size="small" label={templateId} variant="outlined" sx={{ mt: 0.5 }} />
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          {subject ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => void copy(subject, "Asunto")}
            >
              Copiar asunto
            </Button>
          ) : null}
          <Button
            size="small"
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={() => void copy(body, "Cuerpo")}
          >
            Copiar cuerpo
          </Button>
        </Box>
      </Box>

      {subject ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Asunto
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {subject}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sin asunto operativo definido — copie solo el cuerpo.
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary">
        Cuerpo
      </Typography>
      <Typography
        component="pre"
        sx={{
          whiteSpace: "pre-wrap",
          fontFamily: "inherit",
          fontSize: "0.95rem",
          m: 0,
          mt: 0.5,
          bgcolor: "action.hover",
          p: 2,
          borderRadius: 1,
        }}
      >
        {body}
      </Typography>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2000}
        onClose={() => setSnackbar(null)}
        message={snackbar ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Paper>
  );
}
