// Reports shell — a simple left sidebar (styled like the design-system docs
// shell) listing the available reports, with the active report's name in the
// page header and its content in the scrollable area. Report content is
// constrained to a 1400px max width.

import { Box, Typography } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";

import { Logo } from "@/components/logo";
import { PageHeader } from "@/components/page-header";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

const BASE = "/reports";

const REPORTS = [
  { label: "Customer Activity Overview", path: `${BASE}/customer-activity-overview` },
  { label: "Filter Protection Summary", path: `${BASE}/filter-protection-summary` },
  { label: "Timeline Activity Logs", path: `${BASE}/timeline-activity-logs` },
  { label: "Timeline Overview", path: `${BASE}/timeline-overview` },
  { label: "CyberSight AI Usage", path: `${BASE}/cybersight-ai-usage` },
  { label: "Threat Trends", path: `${BASE}/threat-trends` },
] as const;

export default function ReportsLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const active = REPORTS.find((r) => pathname.startsWith(r.path)) ?? REPORTS[0];

  return (
    <Box sx={{ display: "flex", height: "100vh", minHeight: 0 }}>
      {/* Reports sidebar — matches the app side nav styling */}
      <Box
        component="nav"
        sx={{
          width: 260,
          flexShrink: 0,
          backgroundColor: "#000000",
          color: "#ffffff",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          px: 1,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
            pb: 2,
          }}
        >
          <Logo />
          <ThemeModeToggle inline />
        </Box>

        <Typography
          variant="overline"
          sx={{
            display: "block",
            px: 1,
            py: 0,
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          Reports
        </Typography>
        {REPORTS.map((r) => {
          const selected = r.path === active.path;
          return (
            <Box
              key={r.path}
              role="button"
              onClick={() => navigate(r.path)}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                px: 1,
                py: "6px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: selected ? 600 : 400,
                color: "#ffffff",
                backgroundColor: selected
                  ? theme.palette.primary.main
                  : "transparent",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: selected
                    ? theme.palette.primary.main
                    : "rgba(255, 255, 255, 0.1)",
                },
              })}
            >
              {r.label}
            </Box>
          );
        })}
      </Box>

      {/* Content: page header (report name) + scrollable, 1400px-constrained body */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <PageHeader title={active.label} />
        <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, p: 3 }}>
          <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
