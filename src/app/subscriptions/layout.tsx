import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
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
    label: "Organizations",
    icon: <BusinessOutlinedIcon />,
    path: "/subscriptions/manage",
  },
  {
    label: "Billing",
    icon: <CreditCardOutlinedIcon />,
    path: "/subscriptions/billing",
  },
  {
    label: "Plans & Licenses",
    icon: <LayersOutlinedIcon />,
    path: "/subscriptions/plans-licenses",
  },
] as const;

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------

export default function SubscriptionsLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab = TABS.findIndex((tab) => pathname.startsWith(tab.path));
  const tabValue = activeTab === -1 ? 0 : activeTab;

  // The Subscriptions tab holds a wide table, so it renders full-bleed rather
  // than inside the constrained container the other tabs use.
  const isSubscriptionsTab = pathname.startsWith("/subscriptions/manage");

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
      maxWidth={isSubscriptionsTab ? undefined : "lg"}
      header={
        <PageHeader title="Billing & Subscriptions">
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
              aria-label="subscriptions tabs"
              sx={{ px: 3 }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.path}
                  label={tab.label}
                  icon={tab.icon}
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
