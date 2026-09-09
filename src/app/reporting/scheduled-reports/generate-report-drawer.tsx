// "Run Report" drawer — opened from the Templates preview to run a report
// once.
//
// It's the Schedule Report form itself, in its one-time mode: same
// organization, scope, and reporting-period fields, minus the delivery
// schedule, since a one-off run has no frequency to set. Keeping one form
// means the two flows can't drift apart.

import { ScheduleReportView } from "./schedule-report-view";

export function GenerateReportDrawer({
  open,
  onClose,
  onGenerate,
  reportKey,
}: {
  open: boolean;
  onClose: () => void;
  /** Fired when the run is kicked off (the drawer closes itself first). */
  onGenerate: () => void;
  /** Catalog key of the report being run — the form names it in the
   *  subheader, the way the schedule drawer does. */
  reportKey?: string;
}) {
  // Mounted only while open, so each run opens on a fresh form rather than
  // the last one's scope. Same pattern the Schedule drawer uses here.
  if (!open) return null;

  return (
    <ScheduleReportView
      open
      initialReports={reportKey ? [reportKey] : []}
      // A one-off run: no Scheduled / One-Time choice to offer.
      deliveryChoice={false}
      initialDelivery="one-time"
      drawerTitle="Run Report"
      primaryLabel="Run Now"
      onCancel={onClose}
      onSave={() => {
        onClose();
        onGenerate();
      }}
    />
  );
}
