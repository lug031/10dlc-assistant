import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchBrand } from "@/api/brands";
import { createCampaign, createSubmission, fetchCampaignGate } from "@/api/campaigns";
import { CampaignCreationGateAlert } from "@/components/campaigns/CampaignCreationGateAlert";
import { getApiErrorMessage } from "@/config/apiClient";
import type { Brand } from "@/types/brand";
import type { CampaignGateResult } from "@/types/campaignGate";

export function CampaignCreatePage() {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [gate, setGate] = useState<CampaignGateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) return;
    void Promise.all([fetchBrand(brandId), fetchCampaignGate(brandId)])
      .then(([brandData, gateResult]) => {
        setBrand(brandData);
        setGate(gateResult);
        setError(null);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [brandId]);

  const brandDbaName = brand?.dbaName?.trim() || brand?.legalName || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId || !gate?.allowed || !brandDbaName) return;

    try {
      setSubmitting(true);
      setError(null);
      const campaign = await createCampaign(brandId, {
        internalName: brandDbaName,
        useCase: "MARKETING",
      });
      const submission = await createSubmission(campaign.id, {
        copyFromLatest: false,
      });
      navigate(`/campaigns/${campaign.id}/submissions/${submission.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  const formDisabled = !gate?.allowed;

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={600}>
      <Typography variant="h4" gutterBottom>
        Nueva campana
      </Typography>

      {gate && brandId && (
        <CampaignCreationGateAlert gate={gate} brandId={brandId} />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          required
          label="Brand DBA Name"
          value={brandDbaName}
          disabled
        />

        <FormControl required disabled>
          <InputLabel>Caso de uso</InputLabel>
          <Select label="Caso de uso" value="MARKETING">
            <MenuItem value="MARKETING">MARKETING</MenuItem>
          </Select>
        </FormControl>

        <Box display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || formDisabled || !brandDbaName}
          >
            {submitting ? "Creando..." : "Crear campana"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(`/brands/${brandId}/campaigns`)}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
