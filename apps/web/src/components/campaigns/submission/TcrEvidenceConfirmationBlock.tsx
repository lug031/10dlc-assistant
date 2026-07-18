import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  TCR_EVIDENCE_ITEM_KEYS,
  TCR_EVIDENCE_ITEM_LABELS,
  type TcrEvidenceConfirmation,
  type TcrEvidenceItemKey,
  type TcrEvidenceItemStatus,
} from "@/types/tcrEvidence";
import {
  createEmptyTcrEvidenceItems,
  isTcrEvidenceConfirmationComplete,
  tryBuildTcrEvidenceConfirmation,
} from "@/utils/tcrEvidence";

interface TcrEvidenceConfirmationBlockProps {
  value: TcrEvidenceConfirmation | null;
  disabled?: boolean;
  onChange: (value: TcrEvidenceConfirmation | null) => void;
}

export function TcrEvidenceConfirmationBlock({
  value,
  disabled = false,
  onChange,
}: TcrEvidenceConfirmationBlockProps) {
  const items = value?.items ?? createEmptyTcrEvidenceItems();
  const complete = isTcrEvidenceConfirmationComplete(value);

  const setItemStatus = (key: TcrEvidenceItemKey, status: TcrEvidenceItemStatus) => {
    const nextItems = { ...items, [key]: status };
    onChange(tryBuildTcrEvidenceConfirmation(nextItems));
  };

  const handleConfirm = (key: TcrEvidenceItemKey) => {
    setItemStatus(key, "confirmed");
  };

  const handleNotApplicable = (key: TcrEvidenceItemKey) => {
    if (key !== "qrCode") return;
    setItemStatus(key, "not_applicable");
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        TCR Evidence Confirmation
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Los screenshots no se almacenan en 10DLC Assistant. Confirme que la
        evidencia fue preparada para carga manual en Campaign Registry.
      </Alert>

      <Box display="flex" flexDirection="column" gap={1}>
        {TCR_EVIDENCE_ITEM_KEYS.map((key) => (
          <Box
            key={key}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={items[key] === "confirmed"}
                  disabled={disabled}
                  onChange={() => handleConfirm(key)}
                />
              }
              label={TCR_EVIDENCE_ITEM_LABELS[key]}
            />
            {key === "qrCode" && (
              <Button
                size="small"
                variant="text"
                disabled={disabled}
                onClick={() => handleNotApplicable(key)}
              >
                No aplica
              </Button>
            )}
            {items[key] === "not_applicable" && (
              <Typography variant="caption" color="text.secondary">
                Marcado como no aplica
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {complete && value?.confirmedAt && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Evidence Confirmation completa ({new Date(value.confirmedAt).toLocaleString()})
        </Alert>
      )}
    </Paper>
  );
}
