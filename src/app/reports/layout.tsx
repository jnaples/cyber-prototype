// Reports shell — a simple left sidebar (styled like the design-system docs
// shell) listing the available reports, with the active report's name in the
// page header and its content in the scrollable area. Report content is
// constrained to a 1400px max width.

import { Box, Typography } from "@mui/material";
import { Fragment } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { Logo } from "@/components/logo";
import { PageHeader } from "@/components/page-header";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

const BASE = "/reports";

const REPORT_GROUPS = [
  {
    header: "CyberSight Reports",
    items: [
      {
        label: "Activity Summary",
        path: `${BASE}/customer-activity-overview`,
      },
      { label: "Executive Summary", path: `${BASE}/timeline-overview` },
      { label: "AI Tool Usage", path: `${BASE}/cybersight-ai-usage` },
      { label: "Threat Trends", path: `${BASE}/threat-trends` },
    ],
  },
  {
    header: "Legacy Reports",
    items: [
      {
        label: "Filter Protection Summary",
        path: `${BASE}/filter-protection-summary`,
      },
    ],
  },
];

const ALL_REPORTS = REPORT_GROUPS.flatMap((g) => g.items);

export default function ReportsLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const active =
    ALL_REPORTS.find((r) => pathname.startsWith(r.path)) ?? ALL_REPORTS[0];

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

        {REPORT_GROUPS.map((group, gi) => (
          <Fragment key={group.header}>
            <Typography
              variant="overline"
              sx={{
                display: "block",
                px: 1,
                py: 0,
                mt: gi === 0 ? 0 : 1.5,
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              {group.header}
            </Typography>
            {group.items.map((r) => {
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
          </Fragment>
        ))}
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
