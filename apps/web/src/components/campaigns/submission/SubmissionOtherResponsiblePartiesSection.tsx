import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export function SubmissionOtherResponsiblePartiesSection() {
  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Other Responsible Parties
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Select your connectivity partner"
          value="Sinch - Inteliquent, Inc."
          disabled
          fullWidth
        />
        <TextField
          label="Select reseller"
          value="No Reseller"
          disabled
          fullWidth
        />
      </Box>
    </Paper>
  );
}
