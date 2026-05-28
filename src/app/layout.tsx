import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/montserrat/index.css";
import "material-symbols/outlined.css";

import { Box, ThemeProvider as MuiThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";
import { Outlet } from "react-router";

import Footer from "@/components/footer";
import Sidebar from "@/components/side-nav/side-nav";
import { createTheme } from "@/theme/create-theme";
import type {} from "@/theme/extend-theme-types";

const theme = createTheme();

export default function RootLayout() {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
          width: "100%",
          height: "100svh",
        }}
      >
        <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
        <Footer sidebarWidth={isExpanded ? 280 : 72} />
      </Box>
    </MuiThemeProvider>
  );
}
