// Reports v3 — a second variation on the drawer-based scheduling flow. Starts
// as a copy of v2 so the two can be compared side by side, and diverges from
// here: its drawer is the "drawer-v3" variant of the scheduler form.

import ScheduledReportsPage from "../scheduled-reports/page";

export const REPORTS_V3_BASE = "/reporting/reports-v3";

export default function ReportsV3Page() {
  return (
    <ScheduledReportsPage
      basePath={REPORTS_V3_BASE}
      scheduleDrawer="drawer-v3"
    />
  );
}
