// Tools — the operational odds and ends: exports, debugging, certificates.
//
// Only SSL Certificate is built out in the prototype; the rest of the rail is
// there so the section reads as a whole. Audit Logs has a page of its own with
// its own filter bar, so that tab leaves the section rather than living in it.

import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { PageTabs } from "@/components/page-tabs";

// Label-only: these tabs name settings pages, not places on a map.
const TABS = [
  { label: "Data Export", path: "/tools/data-export" },
  { label: "Audit Logs", path: "/audit-logs" },
  { label: "Debug Page", path: "/tools/debug-page" },
  { label: "SSL Certificate", path: "/tools/ssl-certificate" },
] as const;

export default function ToolsLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const active = TABS.findIndex((tab) => pathname.startsWith(tab.path));

  const handleTabChange = (_event: React.SyntheticEvent, value: number) => {
    navigate(TABS[value].path);
  };

  return (
    <PageShell
      // The pages here are a single card of settings, not a full-bleed grid.
      maxWidth="md"
      header={
        <PageHeader title="Tools">
          <PageTabs
            tabs={TABS}
            value={active === -1 ? 0 : active}
            onChange={handleTabChange}
            ariaLabel="tools tabs"
          />
        </PageHeader>
      }
    >
      <Outlet />
    </PageShell>
  );
}
