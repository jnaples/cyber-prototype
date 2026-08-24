// Reports — the Report Manager with drawer-based scheduling: Run Now and
// Schedule Report open their forms in a drawer rather than taking the user to
// the full builder page. The original page is still routable at
// /reporting/scheduled-reports.

import ScheduledReportsPage from "../scheduled-reports/page";

export const REPORTS_BASE = "/reporting/reports";

export default function ReportsPage() {
  return (
    <ScheduledReportsPage basePath={REPORTS_BASE} scheduleDrawer="drawer" />
  );
}
