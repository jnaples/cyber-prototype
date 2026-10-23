// Reports shell — the standalone sidebar layout, listing the available
// reports. Report content is constrained to a 1400px max width.

import { SidebarShell, type SidebarGroup } from "@/components/sidebar-shell";

const BASE = "/reports";

const REPORT_GROUPS: SidebarGroup[] = [
  {
    header: "CyberSight Reports",
    items: [
      {
        label: "Activity Overview",
        path: `${BASE}/customer-activity-overview`,
      },
      { label: "Activity Timeline", path: `${BASE}/timeline-overview` },
      { label: "AI Tool Usage", path: `${BASE}/cybersight-ai-usage` },
      { label: "User Threat Activity", path: `${BASE}/threat-trends` },
    ],
  },
  {
    // The same Activity Overview, rendered from a filtered sample so the
    // report can be read without picking an organization first.
    header: "Sample Filtered Report",
    items: [
      {
        label: "Activity Overview - Filtered",
        path: `${BASE}/customer-activity-overview-filtered`,
      },
    ],
  },
  {
    header: "Filtering Reports",
    items: [
      {
        label: "Filter Protection Overview",
        path: `${BASE}/filter-protection-summary`,
      },
    ],
  },
];

export default function ReportsLayout() {
  return <SidebarShell groups={REPORT_GROUPS} />;
}
