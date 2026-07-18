import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { OperationalOutcome } from "@/types/privacy";
import { isSubmissionBlockedByOutcome } from "@/types/privacyOutcome";

interface SubmissionOptInOutHelpSectionProps {
  operationalOutcome: OperationalOutcome | null | undefined;
  optInDescription: string;
  optOutDescription: string;
  helpResponse: string;
  editable: boolean;
  onOptInChange: (value: string) => void;
  onOptOutChange: (value: string) => void;
  onHelpChange: (value: string) => void;
}

export function SubmissionOptInOutHelpSection({
  operationalOutcome,
  optInDescription,
  optOutDescription,
  helpResponse,
  editable,
  onOptInChange,
  onOptOutChange,
  onHelpChange,
}: SubmissionOptInOutHelpSectionProps) {
  const blocked = isSubmissionBlockedByOutcome(operationalOutcome);
  const fieldsDisabled = !editable || blocked;

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Campaign Attributes
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Subscriber Opt-in"
          value={optInDescription}
          onChange={(e) => onOptInChange(e.target.value)}
          multiline
          minRows={3}
          disabled={fieldsDisabled}
          fullWidth
        />
        <TextField
          label="Subscriber Opt-out"
          value={optOutDescription}
          onChange={(e) => onOptOutChange(e.target.value)}
          multiline
          minRows={3}
          disabled={fieldsDisabled}
          fullWidth
        />
        <TextField
          label="Subscriber Help"
          value={helpResponse}
          onChange={(e) => onHelpChange(e.target.value)}
          multiline
          minRows={3}
          disabled={fieldsDisabled}
          fullWidth
        />
      </Box>
    </Paper>
  );
}
