import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import {
  getTaxIdFieldLabels,
  type BrandRegistrationCountry,
} from "@/constants/brand";

export interface TcrBrandSummaryData {
  legalName: string;
  dbaName: string;
  entityType: string;
  registrationCountry: string;
  einOrTaxId: string;
  taxIdIssuingCountry: string;
  addressStreet: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  websiteUrl: string;
  verticalType: string;
  supportPhoneNumber: string;
  supportEmailAddress: string;
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

interface TcrBrandRegistrationSummaryProps {
  data: TcrBrandSummaryData;
}

export function TcrBrandRegistrationSummary({
  data,
}: TcrBrandRegistrationSummaryProps) {
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const taxLabels = getTaxIdFieldLabels(
    data.taxIdIssuingCountry as BrandRegistrationCountry,
  );

  const copy = (message: string) => setSnackbar(message);

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Resumen para Campaign Registry
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        LW_BRAND_TCR_SUMMARY
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Copia cada valor en el campo correspondiente del portal TCR.
      </Typography>

      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Brand Details
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Brand Legal Name"
            value={data.legalName}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Brand DBA Name, if different from legal name"
            value={data.dbaName}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField
            label="What type of legal form is the organization?"
            value={data.entityType}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField
            label="Country of Registration"
            value={data.registrationCountry}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label={taxLabels.taxIdLabel}
            value={data.einOrTaxId}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField
            label={taxLabels.taxIdIssuingCountryLabel}
            value={data.taxIdIssuingCountry}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Address/Street"
            value={data.addressStreet}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField label="City" value={data.city} onCopy={copy} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField label="State" value={data.state} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField label="ZIP Code" value={data.postalCode} onCopy={copy} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField label="Country" value={data.country} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Website/Online Presence"
            value={data.websiteUrl}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrStaticField label="Vertical Type" value={data.verticalType} />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
        Support Contact
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Support Email Address"
            value={data.supportEmailAddress}
            onCopy={copy}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TcrCopyField
            label="Support Phone Number"
            value={data.supportPhoneNumber}
            onCopy={copy}
          />
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
