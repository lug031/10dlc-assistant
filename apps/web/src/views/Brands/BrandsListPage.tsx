import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router";
import { fetchBrands } from "@/api/brands";
import { getApiErrorMessage } from "@/config/apiClient";
import type { Brand } from "@/types/brand";

type ListFilter = "active" | "archived";

export function BrandsListPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ListFilter>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(
    async (term?: string, listFilter: ListFilter = filter) => {
      try {
        setLoading(true);
        const data = await fetchBrands({
          search: term || undefined,
          archived: listFilter === "archived",
        });
        setBrands(data.items);
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    void loadBrands(search, filter);
  }, [filter, loadBrands]);

  const handleSearch = () => {
    void loadBrands(search, filter);
  };

  const handleFilterChange = (_: React.SyntheticEvent, value: ListFilter) => {
    setFilter(value);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4">Marcas</Typography>
        <Button
          component={RouterLink}
          to="/brands/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Nueva marca
        </Button>
      </Box>

      <Tabs
        value={filter}
        onChange={handleFilterChange}
        sx={{ mb: 2 }}
        aria-label="Filtro de marcas"
      >
        <Tab label="Activas" value="active" />
        <Tab label="Archivadas" value="archived" />
      </Tabs>

      <Box display="flex" gap={1} mb={2}>
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          sx={{ minWidth: 280 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Buscar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre legal</TableCell>
                <TableCell>Alias</TableCell>
                <TableCell>Etapa</TableCell>
                <TableCell>Estado registro</TableCell>
                <TableCell>Actualizado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {filter === "archived"
                      ? "No hay marcas archivadas"
                      : "No hay marcas registradas"}
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow
                    key={brand.id}
                    hover
                    component={RouterLink}
                    to={`/brands/${brand.id}`}
                    sx={{ textDecoration: "none", cursor: "pointer" }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {brand.legalName}
                        {brand.archivedAt && (
                          <Chip label="Archivada" size="small" color="warning" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{brand.internalAlias ?? "—"}</TableCell>
                    <TableCell>
                      <Chip label={brand.workflowStage} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={brand.brandRegistrationStatus}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(brand.updatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
