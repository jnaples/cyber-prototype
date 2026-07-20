import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/montserrat/index.css";
import "material-symbols/outlined.css";

import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "@/App";
import { createTheme } from "@/theme/create-theme";
import type {} from "@/theme/extend-theme-types";

import "./index.css";

// react-draggable (bundled by react-grid-layout) reads `process.env` in a debug
// helper at drag time, which throws "process is not defined" in the browser.
// Provide a minimal shim before anything drags.
const g = globalThis as Record<string, unknown>;
if (typeof g.process === "undefined") {
  g.process = { env: {} };
}

const theme = createTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MuiThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MuiThemeProvider>
  </StrictMode>,
);
