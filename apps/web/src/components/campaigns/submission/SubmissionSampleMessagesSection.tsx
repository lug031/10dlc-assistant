import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { isSubmissionBlockedByOutcome } from "@/types/privacyOutcome";
import type { OperationalOutcome } from "@/types/privacy";
import { SAMPLE_MESSAGE_COUNT } from "@/utils/sampleMessageDefaults";
import { collectSampleMessageFormatWarnings } from "@/utils/sampleMessageFormat";

const highlightedFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#fff8e1",
  },
  "& .MuiInputLabel-root": {
    fontWeight: 600,
  },
};

interface SubmissionSampleMessagesSectionProps {
  sampleMessages: string[];
  operationalOutcome: OperationalOutcome | null | undefined;
  editable: boolean;
  onUpdateSample: (index: number, value: string) => void;
}

export function SubmissionSampleMessagesSection({
  sampleMessages,
  operationalOutcome,
  editable,
  onUpdateSample,
}: SubmissionSampleMessagesSectionProps) {
  const blocked = isSubmissionBlockedByOutcome(operationalOutcome);
  const formatWarnings = collectSampleMessageFormatWarnings(sampleMessages);

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sample Messages
      </Typography>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Formato: DBA Name: mensaje Reply STOP to opt-out
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {Array.from({ length: SAMPLE_MESSAGE_COUNT }, (_, i) => (
          <TextField
            key={i}
            label={`Sample message ${i + 1}`}
            value={sampleMessages[i] ?? ""}
            onChange={(e) => onUpdateSample(i, e.target.value)}
            multiline
            minRows={2}
            disabled={!editable || blocked}
            fullWidth
            sx={highlightedFieldSx}
          />
        ))}

        {formatWarnings.length > 0 && (
          <Alert severity="warning">
            {formatWarnings.map((warning) => (
              <Typography key={warning} variant="body2">
                {warning}
              </Typography>
            ))}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}
