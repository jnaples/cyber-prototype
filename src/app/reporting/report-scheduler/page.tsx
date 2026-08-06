// Report scheduler — the "Schedule Report" builder on its own route so the URL
// reflects the flow. Cancel/Save return to the Report Manager list.

import { useNavigate } from "react-router";

import { ScheduleReportView } from "../scheduled-reports/schedule-report-view";

export default function ReportSchedulerPage() {
  const navigate = useNavigate();
  const back = () => navigate("/reporting/scheduled-reports");
  return <ScheduleReportView onCancel={back} onSave={back} />;
}
