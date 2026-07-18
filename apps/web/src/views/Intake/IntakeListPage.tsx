import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router";
import { deleteIntakeRequest, fetchIntakeRequests } from "@/api/intake";
import { getApiErrorMessage } from "@/config/apiClient";
import type { IntakeRequest } from "@/types/intake";
import { INTAKE_STATUS_LABELS } from "@/types/intake";

export function IntakeListPage() {
  const [items, setItems] = useState<IntakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchIntakeRequests();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (item: IntakeRequest) => {
    if (item.status === "CONVERTED") {
      setError("No se puede eliminar un intake que ya fue convertido a marca.");
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar el intake de "${item.brandName}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      setError(null);
      await deleteIntakeRequest(item.id);
      setItems((prev) => prev.filter((row) => row.id !== item.id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

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
            Intake Requests
          </Typography>
          <Typography color="text.secondary">
            Solicitudes de informacion antes de crear una marca.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/intake/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Nuevo Intake
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Marca</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Actualizado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Sin intake requests. Crea el primero para solicitar
                  informacion.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography
                      component={RouterLink}
                      to={`/intake/${item.id}`}
                      color="primary"
                      sx={{ textDecoration: "none", fontWeight: 500 }}
                    >
                      {item.brandName}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.contactName}</TableCell>
                  <TableCell>{item.contactEmail}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={INTAKE_STATUS_LABELS[item.status]}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip
                      title={
                        item.status === "CONVERTED"
                          ? "No se puede eliminar un intake convertido"
                          : "Eliminar intake"
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={
                            deletingId === item.id || item.status === "CONVERTED"
                          }
                          onClick={() => void handleDelete(item)}
                          aria-label={`Eliminar intake ${item.brandName}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
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
