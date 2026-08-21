// Schedules created during this session. A module-level list rather than
// storage, so a new schedule survives navigating between Report Manager tabs —
// as it would against a real API — but a page reload starts clean again.

export type NewSchedule = {
  name: string;
  /** Grid tags, i.e. the report titles the schedule runs. */
  tags: string[];
  organization: string;
  recipients: number;
  frequency: string;
  /** The day within the frequency: "Mon", "1st", or "" for daily. */
  frequencyDetail: string;
};

const created: NewSchedule[] = [];

export function addCreatedSchedule(schedule: NewSchedule) {
  created.push(schedule);
}

export function getCreatedSchedules(): NewSchedule[] {
  return created;
}
