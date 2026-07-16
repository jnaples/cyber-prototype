// Lightweight design-system docs shell: a Components sidebar on the left, the
// active component's name in a page header, and the component's samples in the
// scrollable content area. Uses our theme tokens/typography throughout.

import { Box, Typography } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";

import { Logo } from "@/components/logo";
import { PageHeader } from "@/components/page-header";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

const BASE = "/design-system";

const COMPONENTS = [
  { label: "Alerts", path: `${BASE}/alerts` },
  { label: "Buttons", path: `${BASE}/buttons` },
  { label: "Cards", path: `${BASE}/cards` },
  { label: "Chips", path: `${BASE}/chips` },
  { label: "Forms", path: `${BASE}/forms` },
  { label: "Page Header", path: `${BASE}/page-header` },
  { label: "Typography", path: `${BASE}/typography` },
] as const;

export default function DesignSystemLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const active =
    COMPONENTS.find((c) => pathname.startsWith(c.path)) ?? COMPONENTS[0];

  return (
    <Box sx={{ display: "flex", height: "100%", minHeight: 0 }}>
      {/* Components sidebar — matches the app side nav styling */}
      <Box
        component="nav"
        sx={{
          width: 240,
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
            py: 1,
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          Components
        </Typography>
        {COMPONENTS.map((c) => {
          const selected = c.path === active.path;
          return (
            <Box
              key={c.path}
              role="button"
              onClick={() => navigate(c.path)}
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
              {c.label}
            </Box>
          );
        })}
      </Box>

      {/* Content: page header (component name) + scrollable samples */}
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
        <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
