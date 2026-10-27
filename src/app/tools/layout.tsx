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

const TABS = [
  { label: "Data Export", icon: "download", path: "/tools/data-export" },
  { label: "Audit Logs", icon: "receipt_long", path: "/audit-logs" },
  { label: "Debug Page", icon: "bug_report", path: "/tools/debug-page" },
  { label: "SSL Certificate", icon: "lock", path: "/tools/ssl-certificate" },
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
