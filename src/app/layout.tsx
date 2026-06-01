import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router";

import Footer from "@/components/footer";
import Sidebar from "@/components/side-nav/side-nav";

export default function RootLayout() {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
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
  );
}
