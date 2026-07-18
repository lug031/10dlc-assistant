import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export interface TcrCampaignSummaryData {
  useCase: string;
  brandDbaName: string;
  campaignDescription: string;
  ctaMessageFlow: string;
  privacyPolicyLink: string;
  sampleMessage1: string;
  sampleMessage2: string;
  subscriberOptIn: string;
  subscriberOptOut: string;
  subscriberHelp: string;
  connectivityPartner: string;
  reseller: string;
}

function TcrStaticField({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        height: "100%",
        bgcolor: "action.hover",
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5, wordBreak: "break-word" }}>
        {value || "—"}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
        Seleccionar en TCR
      </Typography>
    </Box>
  );
}

function TcrCopyField({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (message: string) => void;
}) {
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      onCopy(`${label} copiado`);
    } catch {
      onCopy("No se pudo copiar");
    }
  };

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        height: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={1}
      >
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopyIcon fontSize="small" />}
          onClick={() => void handleCopy()}
          disabled={!value}
          sx={{ flexShrink: 0, py: 0.25 }}
        >
          Copiar
        </Button>
      </Box>
      <Typography
        variant="body1"
        sx={{ mt: 0.5, wordBreak: "break-word", whiteSpace: "pre-wrap" }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

interface TcrCampaignRegistrationSummaryProps {
  data: TcrCampaignSummaryData;
}

export function TcrCampaignRegistrationSummary({
  data,
}: TcrCampaignRegistrationSummaryProps) {
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const copy = (message: string) => setSnackbar(message);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Resumen para Campaign Registry
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Copia cada valor en{" "}
        <a
          href="https://csp.campaignregistry.com/campaign/create"
          target="_blank"
          rel="noreferrer"
        >
          Campaign Registry — crear campaña
        </a>
        .
      </Typography>

      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Campaign Details
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField label="Use-Case" value={data.useCase} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Brand DBA Name"
            value={data.brandDbaName}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TcrCopyField
            label="Campaign Description"
            value={data.campaignDescription}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TcrCopyField
            label="Call-to-Action / Message Flow"
            value={data.ctaMessageFlow}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Privacy Policy Link"
            value={data.privacyPolicyLink}
            onCopy={copy}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
        Sample Messages
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Sample Message 1"
            value={data.sampleMessage1}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Sample Message 2"
            value={data.sampleMessage2}
            onCopy={copy}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
        Campaign Attributes
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TcrCopyField
            label="Subscriber Opt-in"
            value={data.subscriberOptIn}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TcrCopyField
            label="Subscriber Opt-out"
            value={data.subscriberOptOut}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TcrCopyField
            label="Subscriber Help"
            value={data.subscriberHelp}
            onCopy={copy}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
        Other Responsible Parties
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField
            label="Select your connectivity partner"
            value={data.connectivityPartner}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField label="Select reseller" value={data.reseller} />
        </Grid>
      </Grid>

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
