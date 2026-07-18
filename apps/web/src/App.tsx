import { AppThemeProvider } from "@/config/theme";
import { AppRouter } from "@/router";

export function App() {
  return (
    <AppThemeProvider>
      <AppRouter />
    </AppThemeProvider>
  );
}
