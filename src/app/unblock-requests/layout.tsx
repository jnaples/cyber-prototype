import { Tab, Tabs } from "@mui/material";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const TABS = [
  {
    label: "Active Requests",
    icon: "lock_open",
    path: "/unblock-requests/active",
  },
  {
    label: "Request History",
    icon: "history",
    path: "/unblock-requests/history",
  },
] as const;

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------

export default function UnblockRequestsLayout() {
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
    <PageShell
      header={
        <PageHeader title="Unblock Requests">
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
                theme.vars?.palette?.text?.primary ??
                theme.palette.text.primary,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="unblock requests tabs"
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
      }
    >
      <Outlet />
    </PageShell>
  );
}
