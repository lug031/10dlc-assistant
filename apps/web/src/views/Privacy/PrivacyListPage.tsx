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
import {
  fetchCurrentPrivacyReview,
  fetchPrivacyReviews,
} from "@/api/privacy";
import { getApiErrorMessage } from "@/config/apiClient";
import type { Brand } from "@/types/brand";
import {
  PRIVACY_ACCESSIBILITY_SHORT_LABELS,
  PRIVACY_SCENARIO_LABELS,
  type PrivacyReview,
} from "@/types/privacy";

export function PrivacyListPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [reviews, setReviews] = useState<PrivacyReview[]>([]);
  const [current, setCurrent] = useState<PrivacyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!brandId) return;
    try {
      setLoading(true);
      const [brandData, items, currentReview] = await Promise.all([
        fetchBrand(brandId),
        fetchPrivacyReviews(brandId),
        fetchCurrentPrivacyReview(brandId),
      ]);
      setBrand(brandData);
      setReviews(items);
      setCurrent(currentReview);
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
          <Typography variant="h4" gutterBottom>
            Privacidad
          </Typography>
          {brand && (
            <Typography color="text.secondary">{brand.legalName}</Typography>
          )}
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            component={RouterLink}
            to={`/brands/${brandId}/privacy/new`}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Nueva revision
          </Button>
          <Button component={RouterLink} to={`/brands/${brandId}`} variant="outlined">
            Volver a marca
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {current ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Revision vigente
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            <Chip label={`#${current.reviewNumber}`} size="small" />
            <Chip
              label={
                PRIVACY_SCENARIO_LABELS[current.scenarioType] ??
                current.scenarioType
              }
              size="small"
              color="primary"
            />
            <Chip
              label={
                PRIVACY_ACCESSIBILITY_SHORT_LABELS[current.accessibilityStatus]
              }
              size="small"
            />
            <Button
              component={RouterLink}
              to={`/brands/${brandId}/privacy/${current.id}`}
              size="small"
            >
              Ver detalle
            </Button>
          </Box>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay una revision de privacidad marcada como vigente.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Escenario</TableCell>
              <TableCell>Accesibilidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Vigente</TableCell>
              <TableCell>Actualizado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Sin revisiones de privacidad
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow
                  key={review.id}
                  hover
                  component={RouterLink}
                  to={`/brands/${brandId}/privacy/${review.id}`}
                  sx={{ textDecoration: "none", cursor: "pointer" }}
                >
                  <TableCell>{review.reviewNumber}</TableCell>
                  <TableCell>
                    {PRIVACY_SCENARIO_LABELS[review.scenarioType] ??
                      review.scenarioType}
                  </TableCell>
                  <TableCell>
                    {
                      PRIVACY_ACCESSIBILITY_SHORT_LABELS[
                        review.accessibilityStatus
                      ]
                    }
                  </TableCell>
                  <TableCell>{review.status}</TableCell>
                  <TableCell>
                    {review.isCurrent ? (
                      <Chip label="Si" size="small" color="success" />
                    ) : (
                      "No"
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(review.updatedAt).toLocaleString()}
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
