// AgentShield → Sessions — the machines, what ran on them, and when.
//
// A session opens on the first attributed request from an application and
// closes after a quiet gap. The activity band draws those sessions over the
// window the reader picked; the table under it counts them per machine and
// application, and opens to the newest runs behind each row.

/** The windows the activity band can be drawn over. */
export type WindowKey = "24h" | "7d" | "30d" | "12m";

export const WINDOWS: { key: WindowKey; label: string }[] = [
  { key: "24h", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "12m", label: "Last 12 months" },
];

/** One machine and whoever is signed in to it. */
export type Machine = { client: string; user: string };

export const MACHINES: Machine[] = [
  { client: "WKS-4471", user: "k.trojanowski" },
  { client: "WKS-3390", user: "m.okafor" },
  { client: "LAP-2210", user: "d.reyes" },
  { client: "WKS-0912", user: "a.novak" },
  { client: "LAP-1187", user: "s.hall" },
  { client: "WKS-2208", user: "p.lindqvist" },
  { client: "LAP-0455", user: "t.abara" },
  { client: "WKS-6731", user: "r.chen" },
  { client: "LAP-3390", user: "b.ferraro" },
  { client: "WKS-1042", user: "n.whitlock" },
  { client: "WKS-5517", user: "e.sandoval" },
  { client: "LAP-7781", user: "j.mercer" },
];

/**
 * A block on a machine's band: where it starts and ends as a fraction of the
 * window, and how busy it was (0 is empty, 3 is the darkest step).
 */
export type Block = { start: number; end: number; level: number };

/** A stable pseudo-random stream, so a machine's band is the same on every
 *  render without pinning a table of hand-written numbers. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

/** Sessions as separate runs: short blocks with gaps between them, which is
 *  what a day or a week of work actually looks like. */
function runs(seed: number, count: number): Block[] {
  const random = seeded(seed);
  const blocks: Block[] = [];
  let cursor = random() * 0.05;
  for (let index = 0; index < count; index += 1) {
    const width = 0.015 + random() * 0.05;
    if (cursor + width > 0.99) break;
    blocks.push({
      start: cursor,
      end: cursor + width,
      level: 1 + Math.floor(random() * 3),
    });
    cursor += width + 0.01 + random() * 0.07;
  }
  return blocks;
}

/** Sessions as a heat band: one cell per day or month, busy or not. */
function cells(seed: number, count: number, density: number): Block[] {
  const random = seeded(seed);
  const width = 1 / count;
  return Array.from({ length: count }, (_, index) => ({
    start: index * width,
    end: (index + 1) * width,
    level: random() < density ? 1 + Math.floor(random() * 3) : 0,
  }));
}

/** What each window draws, and how its axis is labelled. */
export type WindowShape = {
  /** Blocks per machine, in MACHINES order. */
  bands: Block[][];
  /** The labels under the band, left to right. */
  ticks: string[];
  /** Cells butt against each other; runs float on the track. */
  contiguous: boolean;
  /** Every session the window holds. */
  sessions: number;
};

const hour = (value: number) => `${String(value).padStart(2, "0")}:00`;

/** A date `back` days before today, as the axis prints it. */
const dayLabel = (back: number) => {
  const when = new Date();
  when.setDate(when.getDate() - back);
  return when.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/** A month `back` months before this one. */
const monthLabel = (back: number) => {
  const when = new Date();
  when.setMonth(when.getMonth() - back);
  return when.toLocaleDateString("en-US", { month: "short" });
};

export function shapeFor(window: WindowKey): WindowShape {
  if (window === "24h") {
    return {
      bands: MACHINES.map((_machine, index) =>
        runs(index * 97 + 11, 9 - Math.floor(index / 2)),
      ),
      ticks: [0, 6, 12, 18, 24].map(hour),
      contiguous: false,
      sessions: 1412,
    };
  }
  if (window === "7d") {
    return {
      bands: MACHINES.map((_machine, index) =>
        runs(index * 53 + 7, 13 - Math.floor(index / 2)),
      ),
      ticks: [6, 5, 4, 3, 2, 1, 0].map(dayLabel),
      contiguous: false,
      sessions: 9860,
    };
  }
  if (window === "30d") {
    return {
      bands: MACHINES.map((_machine, index) =>
        cells(index * 31 + 5, 30, 0.75 - index * 0.04),
      ),
      ticks: [29, 22, 15, 8, 1].map(dayLabel),
      contiguous: true,
      sessions: 41300,
    };
  }
  return {
    bands: MACHINES.map((_machine, index) =>
      cells(index * 17 + 3, 12, 0.95 - index * 0.05),
    ),
    ticks: Array.from({ length: 12 }, (_, index) => monthLabel(11 - index)),
    contiguous: true,
    sessions: 486140,
  };
}

/** One run behind a row: when it opened, when it closed, and what it did. */
export type Run = {
  id: string;
  firstRequest: string;
  lastRequest: string;
  user: string;
  requests: number;
  blocked: number;
  threats: number;
  domains: number;
};

/** One application on one machine. */
export type SessionRow = {
  id: string;
  client: string;
  user: string;
  app: string;
  appId: string;
  sessions: number;
  requests: number;
  blocked: number;
  threats: number;
  /** Sessions per day over the window. */
  perDay: number;
  lastStarted: string;
  /** The newest runs, which the row opens to show. */
  runs: Run[];
};

/** `hours` and `minutes` back from now. */
function ago(hours: number, minutes = 0): string {
  const when = new Date();
  when.setHours(when.getHours() - hours, when.getMinutes() - minutes, 0, 0);
  return when.toISOString();
}

/** Five runs for a row, walking backwards from its last start. */
function recentRuns(
  id: string,
  user: string,
  seed: number,
  lastStarted: string,
): Run[] {
  const random = seeded(seed);
  const start = new Date(lastStarted);
  return Array.from({ length: 5 }, (_, index) => {
    const opened = new Date(start);
    opened.setHours(opened.getHours() - index * 5, -Math.floor(random() * 50));
    const closed = new Date(opened);
    closed.setMinutes(closed.getMinutes() + 20 + Math.floor(random() * 70));
    const requests = 700 + Math.floor(random() * 4600);
    return {
      id: `${id}-run-${index}`,
      firstRequest: opened.toISOString(),
      lastRequest: closed.toISOString(),
      // Someone else borrows a machine now and then.
      user: index === 2 ? "j.mercer" : user,
      requests,
      blocked: Math.floor(requests * (0.004 + random() * 0.04)),
      threats: random() < 0.4 ? 1 + Math.floor(random() * 2) : 0,
      domains: 6 + Math.floor(random() * 28),
    };
  });
}

type Seed = [
  client: string,
  app: string,
  appId: string,
  sessions: number,
  requests: number,
  blocked: number,
  threats: number,
  perDay: number,
  hoursAgo: number,
  minutesAgo: number,
];

const SEEDS: Seed[] = [
  ["WKS-4471", "Claude Code", "claude-code", 38, 14152, 487, 2, 5.4, 1, 12],
  ["WKS-3390", "Claude Code", "claude-code", 29, 10744, 460, 1, 4.1, 1, 24],
  ["LAP-2210", "Cursor", "cursor", 24, 9214, 666, 3, 3.4, 2, 5],
  [
    "WKS-0912",
    "GitHub Copilot",
    "github-copilot",
    18,
    5980,
    122,
    0,
    2.6,
    2,
    48,
  ],
  ["LAP-2210", "Windsurf", "windsurf", 7, 1188, 142, 3, 1, 3, 58],
  [
    "LAP-1187",
    "ChatGPT Desktop",
    "chatgpt-desktop",
    11,
    4668,
    302,
    1,
    1.6,
    4,
    16,
  ],
  ["WKS-2208", "Claude Code", "claude-code", 22, 8140, 268, 1, 3.1, 5, 2],
  ["LAP-0455", "Cursor", "cursor", 14, 5210, 410, 0, 2, 6, 31],
  ["WKS-6731", "GitHub Copilot", "github-copilot", 12, 3980, 96, 0, 1.7, 7, 9],
  ["LAP-3390", "Claude Desktop", "claude-desktop", 9, 2640, 58, 0, 1.3, 8, 44],
  ["WKS-1042", "Windsurf", "windsurf", 6, 1104, 88, 1, 0.9, 9, 20],
  [
    "WKS-5517",
    "ChatGPT Desktop",
    "chatgpt-desktop",
    8,
    2980,
    184,
    0,
    1.1,
    11,
    6,
  ],
];

export const SESSION_ROWS: SessionRow[] = SEEDS.map(
  (
    [
      client,
      app,
      appId,
      sessions,
      requests,
      blocked,
      threats,
      perDay,
      hoursAgo,
      minutesAgo,
    ],
    index,
  ) => {
    const machine = MACHINES.find((m) => m.client === client);
    const user = machine?.user ?? "unknown";
    const lastStarted = ago(hoursAgo, minutesAgo);
    const id = `${client}-${appId}`.toLowerCase();
    return {
      id,
      client,
      user,
      app,
      appId,
      sessions,
      requests,
      blocked,
      threats,
      perDay,
      lastStarted,
      runs: recentRuns(id, user, index * 41 + 13, lastStarted),
    };
  },
);
