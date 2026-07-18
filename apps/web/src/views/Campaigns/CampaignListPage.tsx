import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import { fetchBrand } from "@/api/brands";
import { fetchCampaignGate, fetchCampaigns } from "@/api/campaigns";
import { getApiErrorMessage } from "@/config/apiClient";
import { CampaignCreationGateAlert } from "@/components/campaigns/CampaignCreationGateAlert";
import type { Brand } from "@/types/brand";
import type { Campaign } from "@/types/campaign";
import type { CampaignGateResult } from "@/types/campaignGate";

export function CampaignListPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [gate, setGate] = useState<CampaignGateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!brandId) return;
    try {
      setLoading(true);
      const [brandData, items, gateResult] = await Promise.all([
        fetchBrand(brandId),
        fetchCampaigns(brandId),
        fetchCampaignGate(brandId),
      ]);
      setBrand(brandData);
      setCampaigns(items);
      setGate(gateResult);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h4">Campanas</Typography>
          {brand && (
            <Typography color="text.secondary">{brand.legalName}</Typography>
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Button
            component={RouterLink}
            to={`/brands/${brandId}/campaigns/new`}
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!gate?.allowed}
          >
            Nueva campana
          </Button>
          <Button component={RouterLink} to={`/brands/${brandId}`} variant="outlined">
            Volver a marca
          </Button>
        </Box>
      </Box>

      {gate && brandId && (
        <CampaignCreationGateAlert gate={gate} brandId={brandId} />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Caso de uso</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Actualizado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Sin campanas registradas
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  hover
                  component={RouterLink}
                  to={`/campaigns/${campaign.id}`}
                  sx={{ textDecoration: "none", cursor: "pointer" }}
                >
                  <TableCell>{campaign.internalName}</TableCell>
                  <TableCell>{campaign.useCase}</TableCell>
                  <TableCell>
                    <Chip label={campaign.currentStatus} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.updatedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
