// Report scheduler — the "Schedule Report" builder on its own route so the URL
// reflects the flow. Cancel/Save return to the Report Manager list.

import { useLocation, useNavigate } from "react-router";

import { ScheduleReportView } from "../scheduled-reports/schedule-report-view";

export default function ReportSchedulerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Arriving from a Library preview preselects that report.
  const { reportKeys } = (location.state ?? {}) as { reportKeys?: string[] };
  const back = () => navigate("/reporting/scheduled-reports");
  return (
    <ScheduleReportView
      initialReports={reportKeys}
      onCancel={back}
      onSave={back}
    />
  );
}
