import AttachFileIcon from "@mui/icons-material/AttachFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { CopyFieldCard } from "@/components/intake/CopyFieldCard";
import {
  INTAKE_EMAIL_ATTACHMENT_FILENAME,
  buildIntakeEmailMarkdown,
  buildIntakeEmailSubject,
  buildWebsiteIssueNote,
  copyEmailBodyToClipboard,
  markdownToEmailHtml,
} from "@/utils/intakeEmailMarkdown";

interface IntakeEmailPanelProps {
  brandName: string;
  contactName?: string;
  contactEmail: string;
}

export function IntakeEmailPanel({
  brandName,
  contactName,
  contactEmail,
}: IntakeEmailPanelProps) {
  const [hasAccessiblePrivacyPolicy, setHasAccessiblePrivacyPolicy] =
    useState(false);
  const [includeWebsiteIssue, setIncludeWebsiteIssue] = useState(true);
  const [websiteIssueNote, setWebsiteIssueNote] = useState(() =>
    buildWebsiteIssueNote(brandName),
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setWebsiteIssueNote(buildWebsiteIssueNote(brandName));
  }, [brandName]);

  const subject = useMemo(
    () => buildIntakeEmailSubject(brandName),
    [brandName],
  );

  const emailMarkdown = useMemo(
    () =>
      buildIntakeEmailMarkdown({
        brandName,
        contactName,
        hasAccessiblePrivacyPolicy,
        includeWebsiteIssue,
        websiteIssueNote,
      }),
    [
      brandName,
      contactName,
      hasAccessiblePrivacyPolicy,
      includeWebsiteIssue,
      websiteIssueNote,
    ],
  );

  const previewHtml = useMemo(
    () => markdownToEmailHtml(emailMarkdown),
    [emailMarkdown],
  );

  const handleCopyBody = async () => {
    try {
      await copyEmailBodyToClipboard(emailMarkdown);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Correo de solicitud
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Copia el correo del contacto, el asunto y el cuerpo en tu cliente de
        correo. El cuerpo se pega con formato listo para enviar.
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
        <Button
          size="small"
          variant={!hasAccessiblePrivacyPolicy ? "contained" : "outlined"}
          onClick={() => setHasAccessiblePrivacyPolicy(false)}
        >
          Requiere política de privacidad
        </Button>
        <Button
          size="small"
          variant={hasAccessiblePrivacyPolicy ? "contained" : "outlined"}
          onClick={() => setHasAccessiblePrivacyPolicy(true)}
        >
          Política accesible en sitio web
        </Button>
      </Box>

      {!hasAccessiblePrivacyPolicy && (
        <Alert
          severity="warning"
          icon={<AttachFileIcon fontSize="inherit" />}
          sx={{ mb: 2 }}
        >
          Recuerda adjuntar el archivo{" "}
          <strong>{INTAKE_EMAIL_ATTACHMENT_FILENAME}</strong> al enviar este
          correo.
        </Alert>
      )}

      <CopyFieldCard label="Correo del contacto" value={contactEmail} />
      <CopyFieldCard label="Asunto" value={subject} />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          mb={2}
          flexWrap="wrap"
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Texto del correo
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={() => void handleCopyBody()}
            disabled={!brandName.trim()}
          >
            COPIAR
          </Button>
        </Box>

        {!hasAccessiblePrivacyPolicy && (
          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            <Button
              size="small"
              variant={includeWebsiteIssue ? "contained" : "outlined"}
              onClick={() => setIncludeWebsiteIssue(true)}
            >
              Incluir nota de sitio web
            </Button>
            <Button
              size="small"
              variant={!includeWebsiteIssue ? "contained" : "outlined"}
              onClick={() => setIncludeWebsiteIssue(false)}
            >
              Omitir nota de sitio web
            </Button>
          </Box>
        )}

        {!hasAccessiblePrivacyPolicy && includeWebsiteIssue && (
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Nota de intermitencias / Facebook"
            value={websiteIssueNote}
            onChange={(e) => setWebsiteIssueNote(e.target.value)}
            helperText="Incluida por defecto. Puedes editarla antes de copiar el correo."
            sx={{ mb: 2 }}
          />
        )}

        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          Vista previa
        </Typography>
        <Box
          sx={{
            bgcolor: "action.hover",
            p: 2,
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: 16,
            lineHeight: 1.3,
            color: "#000",
            "& p:last-child": { mb: 0 },
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Copiado al portapapeles"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Paper>
  );
}
