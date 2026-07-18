import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { OperationalOutcome } from "@/types/privacy";
import type { SampleMultimediaConfirmation } from "@/types/sampleMultimedia";
import { isSubmissionBlockedByOutcome } from "@/types/privacyOutcome";
import {
  buildSampleMultimediaFilenames,
  isSampleMultimediaComplete,
} from "@/utils/sampleMultimedia";
import { sampleMultimediaFileDescription } from "@/utils/hardToFindPrivacyGuide";

const TCR_CAMPAIGN_CREATE_URL = "https://csp.campaignregistry.com/campaign/create";

interface SubmissionSampleMultimediaSectionProps {
  operationalOutcome: OperationalOutcome | null | undefined;
  optInKeyword: string;
  confirmation: SampleMultimediaConfirmation | null;
  editable: boolean;
  onChange: (value: SampleMultimediaConfirmation) => void;
}

export function SubmissionSampleMultimediaSection({
  operationalOutcome,
  optInKeyword,
  confirmation,
  editable,
  onChange,
}: SubmissionSampleMultimediaSectionProps) {
  const blocked = isSubmissionBlockedByOutcome(operationalOutcome);
  const fieldsDisabled = !editable || blocked;
  const requiredFiles = buildSampleMultimediaFilenames(
    operationalOutcome,
    optInKeyword,
  );
  const items = confirmation?.items ?? {};
  const complete = isSampleMultimediaComplete(confirmation, requiredFiles);

  const handleToggle = (filename: string, checked: boolean) => {
    if (!confirmation) return;
    onChange({
      items: { ...confirmation.items, [filename]: checked },
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sample Multimedia
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Marque cada archivo después de adjuntarlo en{" "}
        <Link href={TCR_CAMPAIGN_CREATE_URL} target="_blank" rel="noreferrer">
          Campaign Registry
        </Link>
        . Todos los checks son obligatorios para continuar.
      </Typography>

      {operationalOutcome === "HARD_TO_FIND" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          CASO 2 — Política difícil de encontrar. Adjunte screenshots que
          documenten el recorrido paso a paso hacia la política de privacidad
          (first-step, second-step, last-step).
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={1}>
        {requiredFiles.map((filename) => {
          const description = sampleMultimediaFileDescription(
            filename,
            optInKeyword,
          );
          return (
          <Box
            key={filename}
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <FormControlLabel
              sx={{ alignItems: "flex-start", m: 0 }}
              control={
                <Checkbox
                  checked={items[filename] === true}
                  disabled={fieldsDisabled}
                  onChange={(e) => handleToggle(filename, e.target.checked)}
                  sx={{ pt: 0.25 }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {filename}
                  </Typography>
                  {description && (
                    <Typography variant="caption" color="text.secondary">
                      {description}
                    </Typography>
                  )}
                </Box>
              }
            />
            {items[filename] === true && (
              <Box display="flex" alignItems="center" gap={0.5} color="success.main">
                <CheckCircleIcon fontSize="small" />
                <Typography variant="caption">Listo</Typography>
              </Box>
            )}
          </Box>
          );
        })}
      </Box>

      {complete && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Todos los archivos de Sample Multimedia están marcados como listos.
        </Alert>
      )}
    </Paper>
  );
}
