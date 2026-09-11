// Standalone page shell with its own dark sidebar — for the routes rendered
// outside the app shell (/reports, /tray), where the main side nav shouldn't
// also be showing. Grouped links on the left, the active link's name in the
// page header, and the page itself in a scrollable, 1400px-constrained body.

import { Box, Typography } from "@mui/material";
import { Fragment } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { Logo } from "@/components/logo";
import { PageHeader } from "@/components/page-header";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

export type SidebarLink = {
  label: string;
  path: string;
  /** Page header, when it should read differently from the nav link. */
  title?: string;
};

/** A section of the sidebar. The header renders as an overline, so it's
 *  uppercased for you; leave it off for a section of bare links. */
export type SidebarGroup = { header?: string; items: SidebarLink[] };

export function SidebarShell({ groups }: { groups: SidebarGroup[] }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const links = groups.flatMap((g) => g.items);
  const active = links.find((r) => pathname.startsWith(r.path)) ?? links[0];

  return (
    <Box sx={{ display: "flex", height: "100vh", minHeight: 0 }}>
      {/* Sidebar — matches the app side nav styling */}
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

        {groups.map((group, gi) => (
          <Fragment key={group.header ?? gi}>
            {group.header && (
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
            )}
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

      {/* Content: page header (active link) + scrollable, constrained body */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <PageHeader title={active.title ?? active.label} />
        <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, p: 3 }}>
          <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
