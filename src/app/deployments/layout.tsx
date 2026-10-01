import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { OrgScopeSlot } from "@/components/org-scope-slot";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { PageTabs } from "@/components/page-tabs";

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
  {
    label: "Relays",
    icon: "device_hub",
    path: "/deployments/relays",
  },
  {
    label: "Clientless",
    icon: "dns",
    path: "/deployments/clientless",
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

  return (
    <PageShell
      // The grids on these tabs fill the page and scroll their own rows.
      fill
      header={
        <PageHeader title="Deployments" leftSlot={<OrgScopeSlot />}>
          <PageTabs
            tabs={TABS}
            value={tabValue}
            onChange={handleTabChange}
            ariaLabel="deployments tabs"
          />
        </PageHeader>
      }
    >
      <Outlet />
    </PageShell>
  );
}
