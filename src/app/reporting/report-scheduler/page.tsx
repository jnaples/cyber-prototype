// Report scheduler — the "Schedule Report" builder on its own route so the URL
// reflects the flow. Cancel/Save return to the Report Manager list.

import { useLocation, useNavigate } from "react-router";

import { ScheduleReportView } from "../scheduled-reports/schedule-report-view";
import type { ScheduleEditState } from "../scheduled-reports/schedule-edit-state";

export default function ReportSchedulerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Arriving from a Schedules row's Edit action seeds the whole form from that
  // row; arriving from a Library preview only carries the report being viewed.
  const { edit, reportKeys } = (location.state ?? {}) as {
    edit?: ScheduleEditState;
    reportKeys?: string[];
  };

  const back = (toast?: string) =>
    navigate("/reporting/scheduled-reports/schedules", {
      state: toast ? { toast } : undefined,
    });

  return (
    <ScheduleReportView
      edit={edit}
      initialReports={reportKeys}
      onCancel={() => back()}
      onSave={() => back(edit ? `${edit.scheduleName} updated.` : undefined)}
    />
  );
}
