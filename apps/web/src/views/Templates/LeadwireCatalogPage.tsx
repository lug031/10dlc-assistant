import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
  LEADWIRE_CATALOG,
  PENDING_LEADWIRE_TEXT,
  type LeadwireCatalogCategory,
} from "@/constants/leadwireCatalog";
import { LEADWIRE_CAMPAIGN_TEMPLATES } from "@/constants/leadwireCampaignTemplates";
import { LEADWIRE_COMMUNICATION_TEMPLATES } from "@/constants/leadwireCommunicationTemplates";

const CATEGORY_LABELS: Record<LeadwireCatalogCategory, string> = {
  COMMUNICATION: "Comunicación",
  CAMPAIGN: "Campaña",
  BRAND_UI: "Marca (UI)",
  COMPLIANCE: "Cumplimiento",
  OTHER: "Otro",
};

function resolvePreviewText(entryId: string): string | null {
  if (entryId in LEADWIRE_COMMUNICATION_TEMPLATES) {
    const tpl =
      LEADWIRE_COMMUNICATION_TEMPLATES[
        entryId as keyof typeof LEADWIRE_COMMUNICATION_TEMPLATES
      ];
    return tpl.body;
  }

  if (entryId in LEADWIRE_CAMPAIGN_TEMPLATES) {
    return LEADWIRE_CAMPAIGN_TEMPLATES[
      entryId as keyof typeof LEADWIRE_CAMPAIGN_TEMPLATES
    ];
  }

  if (entryId === "LW_BRAND_TCR_SUMMARY") {
    return "Comportamiento de UI — resumen TCR copiable en Intake Convert, Brand Create/Edit y Brand Detail.";
  }

  return null;
}

export function LeadwireCatalogPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Catálogo Leadwire
      </Typography>
      <Typography color="text.secondary" paragraph>
        Auditoría de plantillas operativas LW_*. Solo lectura — los textos no se
        editan desde esta aplicación.
      </Typography>

      <Alert severity="info" sx={{ mb: 3, maxWidth: 960 }}>
        Slots sin texto oficial muestran únicamente:{" "}
        <strong>{PENDING_LEADWIRE_TEXT}</strong>
      </Alert>

      <Paper sx={{ maxWidth: 1200, overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {LEADWIRE_CATALOG.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {entry.id}
                  </Typography>
                </TableCell>
                <TableCell>{CATEGORY_LABELS[entry.category]}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={entry.hasApprovedText ? "success" : "warning"}
                    label={
                      entry.hasApprovedText
                        ? "Texto aprobado"
                        : PENDING_LEADWIRE_TEXT
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ mt: 4, maxWidth: 960 }}>
        <Typography variant="h6" gutterBottom>
          Vista previa de textos aprobados
        </Typography>
        {LEADWIRE_CATALOG.filter((e) => e.hasApprovedText && e.id !== "LW_BRAND_TCR_SUMMARY").map(
          (entry) => {
            const text = resolvePreviewText(entry.id);
            if (!text) return null;

            return (
              <Paper key={entry.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {entry.id}
                </Typography>
                <Typography
                  component="pre"
                  sx={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    fontSize: "0.85rem",
                    m: 0,
                    maxHeight: 240,
                    overflow: "auto",
                    bgcolor: "action.hover",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {text}
                </Typography>
              </Paper>
            );
          },
        )}
      </Box>
    </Box>
  );
}
