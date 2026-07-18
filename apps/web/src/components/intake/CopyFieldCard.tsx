import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useState } from "react";

interface CopyFieldCardProps {
  label: string;
  value: string;
  multiline?: boolean;
}

export function CopyFieldCard({
  label,
  value,
  multiline = false,
}: CopyFieldCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
        mb={1}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {label}
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={() => void handleCopy()}
          disabled={!value}
        >
          COPIAR
        </Button>
      </Box>
      <Typography
        component={multiline ? "pre" : "p"}
        sx={{
          whiteSpace: multiline ? "pre-wrap" : "normal",
          fontFamily: multiline ? "inherit" : undefined,
          m: 0,
          bgcolor: "action.hover",
          p: 2,
          borderRadius: 1,
        }}
      >
        {value || "—"}
      </Typography>
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
