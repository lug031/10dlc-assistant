import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  BRAND_ENTITY_TYPE,
  BRAND_REGISTRATION_COUNTRIES,
  BRAND_VERTICAL_TYPE,
  getTaxIdFieldLabels,
  type BrandRegistrationCountry,
} from "@/constants/brand";
import type { TcrBrandFormState } from "@/components/brands/tcrBrandForm";

interface TcrBrandRegistrationFormProps {
  form: TcrBrandFormState;
  onChange: (field: keyof TcrBrandFormState, value: string) => void;
  supportEmailHelperText?: string;
}

export function TcrBrandRegistrationForm({
  form,
  onChange,
  supportEmailHelperText = "Correo de soporte de la marca",
}: TcrBrandRegistrationFormProps) {
  const taxLabels = getTaxIdFieldLabels(form.taxIdIssuingCountry);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Datos de la marca
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            label="Brand Legal Name"
            value={form.legalName}
            onChange={(e) => onChange("legalName", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Brand DBA Name, if different from legal name"
            value={form.dbaName}
            onChange={(e) => onChange("dbaName", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="What type of legal form is the organization?"
            value={BRAND_ENTITY_TYPE}
            disabled
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel id="registration-country-label">
              Country of Registration
            </InputLabel>
            <Select
              labelId="registration-country-label"
              label="Country of Registration"
              value={form.registrationCountry}
              onChange={(e) =>
                onChange(
                  "registrationCountry",
                  e.target.value as BrandRegistrationCountry,
                )
              }
            >
              {BRAND_REGISTRATION_COUNTRIES.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            label={taxLabels.taxIdLabel}
            value={form.einOrTaxId}
            onChange={(e) => onChange("einOrTaxId", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel id="tax-id-country-label">
              {taxLabels.taxIdIssuingCountryLabel}
            </InputLabel>
            <Select
              labelId="tax-id-country-label"
              label={taxLabels.taxIdIssuingCountryLabel}
              value={form.taxIdIssuingCountry}
              onChange={(e) =>
                onChange(
                  "taxIdIssuingCountry",
                  e.target.value as BrandRegistrationCountry,
                )
              }
            >
              {BRAND_REGISTRATION_COUNTRIES.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            label="Address/Street"
            value={form.legalAddressLine1}
            onChange={(e) => onChange("legalAddressLine1", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            label="City"
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            label="State"
            value={form.state}
            onChange={(e) => onChange("state", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            value={form.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Country"
            value={form.registrationCountry}
            disabled
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Website/Online Presence"
            value={form.websiteUrl}
            onChange={(e) => onChange("websiteUrl", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Vertical Type"
            value={BRAND_VERTICAL_TYPE}
            disabled
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>
        Support Contact
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            type="email"
            label="Support Email Address"
            value={form.supportEmailAddress}
            onChange={(e) => onChange("supportEmailAddress", e.target.value)}
            helperText={supportEmailHelperText}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            label="Support Phone Number"
            placeholder="+10123456789"
            value={form.supportPhoneNumber}
            onChange={(e) => onChange("supportPhoneNumber", e.target.value)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
