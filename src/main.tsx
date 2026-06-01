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

const theme = createTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MuiThemeProvider>
  </StrictMode>,
);
