import { Chip, Divider, Tab, Tabs, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { PageHeader } from "@/components/page-header";

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const TABS = [
  { label: "Sites", icon: "location_on", path: "/deployments/sites" },
  {
    label: "Roaming Clients",
    icon: "devices",
    path: "/deployments/roaming-clients",
  },
] as const;

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------

export default function DeploymentsLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab = TABS.findIndex((tab) => pathname.startsWith(tab.path));
  const tabValue = activeTab === -1 ? 0 : activeTab;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(TABS[newValue].path);
  };

  const selectedTabSx = {
    "&.Mui-selected": {
      backgroundColor: (
        theme: Theme & {
          vars?: { palette?: { background?: { paper?: string } } };
        },
      ) =>
        theme.vars?.palette?.background?.paper ??
        theme.palette.background.paper,
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      boxShadow: (theme: Theme) => theme.shadows[3],
      zIndex: (theme: Theme) => theme.zIndex.appBar,
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <PageHeader
        title="Deployments"
        leftSlot={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography variant="body2" color="text.secondary">
              All Organizations
            </Typography>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "divider", mx: "8px" }}
            />
            <Chip
              label="Managing 90 Organizations"
              onClick={() => {}}
              sx={{ borderRadius: "8px", fontSize: "14px" }}
              deleteIcon={
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 18,
                    color: "var(--mui-palette-text-primary)",
                  }}
                >
                  filter_list
                </span>
              }
              onDelete={() => {}}
              size="small"
            />
          </div>
        }
      >
        <Box
          sx={{
            mb: -2,
            display: "flex",
            alignContent: "flex-end",
            backgroundColor: (
              theme: Theme & {
                vars?: { palette?: { background?: { neutral?: string } } };
              },
            ) =>
              theme.vars?.palette?.background?.neutral ??
              theme.palette.background.neutral,
            color: (
              theme: Theme & {
                vars?: { palette?: { text?: { primary?: string } } };
              },
            ) =>
              theme.vars?.palette?.text?.primary ?? theme.palette.text.primary,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="deployments tabs"
            sx={{ px: 3 }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.path}
                label={tab.label}
                icon={
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    {tab.icon}
                  </span>
                }
                sx={selectedTabSx}
              />
            ))}
          </Tabs>
        </Box>
      </PageHeader>

      <Box
        sx={{
          p: 2,
          minWidth: 0,
          minHeight: 0,
          flex: 1,
          maxWidth: "100%",
          overflow: "auto",
          color: (
            theme: Theme & {
              vars?: { palette?: { text?: { primary?: string } } };
            },
          ) => theme.vars?.palette?.text?.primary ?? theme.palette.text.primary,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
