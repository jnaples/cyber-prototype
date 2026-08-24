// Reports v2 — the same Report Manager, with one difference: Schedule Report
// opens the Schedule Details form in a drawer instead of taking the user to
// the full builder page. A trial of the simplified flow.

import ScheduledReportsPage from "../scheduled-reports/page";

export const REPORTS_V2_BASE = "/reporting/reports-v2";

export default function ReportsV2Page() {
  return (
    <ScheduledReportsPage basePath={REPORTS_V2_BASE} scheduleDrawer="drawer" />
  );
}
