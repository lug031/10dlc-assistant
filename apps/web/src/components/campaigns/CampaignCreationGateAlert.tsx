import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router";
import {
  CAMPAIGN_GATE_MESSAGES,
  type CampaignGateResult,
} from "@/types/campaignGate";

interface CampaignCreationGateAlertProps {
  gate: CampaignGateResult;
  brandId: string;
}

export function CampaignCreationGateAlert({
  gate,
  brandId,
}: CampaignCreationGateAlertProps) {
  if (gate.allowed) {
    return null;
  }

  const message = gate.reasonCode
    ? CAMPAIGN_GATE_MESSAGES[gate.reasonCode]
    : "La compuerta operativa esta cerrada.";

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      action={
        <Button
          component={RouterLink}
          to={`/brands/${brandId}/privacy`}
          size="small"
        >
          Ir a privacidad
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
