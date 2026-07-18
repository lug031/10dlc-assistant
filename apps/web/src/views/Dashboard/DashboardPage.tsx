import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router";
import { fetchBrands, fetchHealth } from "@/api/brands";
import { fetchIntakeSummary } from "@/api/intake";
import { getApiErrorMessage } from "@/config/apiClient";
import type { IntakeSummary } from "@/types/intake";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<string | null>(null);
  const [brandCount, setBrandCount] = useState(0);
  const [intakeSummary, setIntakeSummary] = useState<IntakeSummary | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [healthData, brandsData, summary] = await Promise.all([
          fetchHealth(),
          fetchBrands(),
          fetchIntakeSummary(),
        ]);
        setHealth(`${healthData.status} (v${healthData.version})`);
        setBrandCount(brandsData.total);
        setIntakeSummary(summary);
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" paragraph>
        Asistente para registro manual de marcas y campanas 10DLC.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              API
            </Typography>
            <Typography variant="h6">{health ?? "—"}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Marcas activas
            </Typography>
            <Typography variant="h6">{brandCount}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" gutterBottom>
        Intake Requests
      </Typography>
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <Card sx={{ minWidth: 160 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Pendientes
            </Typography>
            <Typography variant="h6">{intakeSummary?.draft ?? 0}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Enviados
            </Typography>
            <Typography variant="h6">{intakeSummary?.sent ?? 0}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Respondidos
            </Typography>
            <Typography variant="h6">
              {intakeSummary?.responded ?? 0}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 160 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Convertidos
            </Typography>
            <Typography variant="h6">
              {intakeSummary?.converted ?? 0}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" gutterBottom>
        Iniciar proceso
      </Typography>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Button
          component={RouterLink}
          to="/intake/new"
          variant="contained"
          size="large"
        >
          Solicitar informacion de marca
        </Button>
        <Button
          component={RouterLink}
          to="/brands/new"
          variant="outlined"
          size="large"
        >
          Tengo toda la informacion — Crear marca
        </Button>
      </Box>
    </Box>
  );
}
