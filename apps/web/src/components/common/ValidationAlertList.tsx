import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import type { ValidationIssue } from "@/types/privacy";

interface ValidationAlertListProps {
  blocking?: ValidationIssue[];
  warnings?: ValidationIssue[];
}

function IssueList({ issues }: { issues: ValidationIssue[] }) {
  return (
    <List dense disablePadding>
      {issues.map((issue) => (
        <ListItem key={`${issue.code}-${issue.field}`} disableGutters>
          <ListItemText primary={issue.message} secondary={issue.field} />
        </ListItem>
      ))}
    </List>
  );
}

export function ValidationAlertList({
  blocking = [],
  warnings = [],
}: ValidationAlertListProps) {
  if (blocking.length === 0 && warnings.length === 0) return null;

  return (
    <Box display="flex" flexDirection="column" gap={2} mb={2}>
      {blocking.length > 0 && (
        <Alert severity="error">
          <AlertTitle>Errores bloqueantes</AlertTitle>
          <IssueList issues={blocking} />
        </Alert>
      )}
      {warnings.length > 0 && (
        <Alert severity="warning">
          <AlertTitle>Advertencias</AlertTitle>
          <IssueList issues={warnings} />
        </Alert>
      )}
    </Box>
  );
}
