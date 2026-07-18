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
import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import {
  createSubmission,
  fetchCampaign,
  fetchCampaignGate,
  fetchSubmissions,
} from "@/api/campaigns";
import { CampaignCreationGateAlert } from "@/components/campaigns/CampaignCreationGateAlert";
import { CampaignOperationalSummary } from "@/components/campaigns/CampaignOperationalSummary";
import { getApiErrorMessage } from "@/config/apiClient";
import type { Campaign, CampaignSubmission } from "@/types/campaign";
import type { CampaignGateResult } from "@/types/campaignGate";

export function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([]);
  const [gate, setGate] = useState<CampaignGateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [ensuringSubmission, setEnsuringSubmission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const ensuredRef = useRef(false);

  const load = useCallback(async () => {
    if (!campaignId) return;
    try {
      setLoading(true);
      const camp = await fetchCampaign(campaignId);
      const [subs, gateResult] = await Promise.all([
        fetchSubmissions(campaignId),
        fetchCampaignGate(camp.brandId),
      ]);
      setCampaign(camp);
      setSubmissions(subs);
      setGate(gateResult);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading || !campaignId || !gate || ensuredRef.current) return;

    if (submissions.length === 1) {
      ensuredRef.current = true;
      navigate(`/campaigns/${campaignId}/submissions/${submissions[0].id}`, {
        replace: true,
      });
      return;
    }

    if (submissions.length === 0 && gate.allowed) {
      ensuredRef.current = true;
      setEnsuringSubmission(true);
      void createSubmission(campaignId, { copyFromLatest: false })
        .then((submission) => {
          navigate(`/campaigns/${campaignId}/submissions/${submission.id}`, {
            replace: true,
          });
        })
        .catch((err) => {
          ensuredRef.current = false;
          setError(getApiErrorMessage(err));
        })
        .finally(() => setEnsuringSubmission(false));
    }
  }, [loading, submissions, gate, campaignId, navigate]);

  if (loading || ensuringSubmission) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!campaign || !gate) {
    return <Alert severity="error">{error ?? "Campana no encontrada"}</Alert>;
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
          <Typography variant="h4">{campaign.internalName}</Typography>
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            <Chip label={campaign.useCase} size="small" />
            <Chip label={campaign.currentStatus} size="small" color="primary" />
          </Box>
        </Box>
        <Button
          component={RouterLink}
          to={`/brands/${campaign.brandId}`}
          variant="outlined"
        >
          Volver a marca
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CampaignCreationGateAlert gate={gate} brandId={campaign.brandId} />

      <CampaignOperationalSummary gate={gate} submissions={submissions} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Privacy review</TableCell>
              <TableCell>Actualizado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {gate.allowed
                    ? "Preparando envío de registro..."
                    : "El envío se habilitará cuando la compuerta operativa esté abierta."}
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub) => (
                <TableRow
                  key={sub.id}
                  hover
                  component={RouterLink}
                  to={`/campaigns/${campaignId}/submissions/${sub.id}`}
                  sx={{ textDecoration: "none", cursor: "pointer" }}
                >
                  <TableCell>{sub.submissionNumber}</TableCell>
                  <TableCell>
                    <Chip label={sub.status} size="small" />
                  </TableCell>
                  <TableCell>
                    {sub.privacyReviewId ? sub.privacyReviewId.slice(0, 8) : "—"}
                  </TableCell>
                  <TableCell>
                    {new Date(sub.updatedAt).toLocaleString()}
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
