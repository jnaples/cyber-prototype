// Secure Shield — mock data for the agent-activity timeline.
//
// Each "scenario" is an ordered list of events captured during a single
// autonomous-agent session on a roaming client. The Castellanos benign run
// completes cleanly; the Whitlock run escalates into a blocked exfiltration
// attempt that Secure Shield quarantines.

export type Severity = "info" | "allowed" | "success" | "warning" | "threat";

export type EventRow = { k: string; v: string; mono?: boolean };

export type SecurityEvent = {
  cat: string;
  title: string;
  icon: string;
  sev: Severity;
  time: string;
  summary: string;
  threat?: string;
  rows: EventRow[];
};

export type ScenarioId = "benign" | "rogue";

export type ClientInfo = {
  id: ScenarioId;
  name: string;
  user: string;
  status: string;
  tone: "ok" | "bad";
};

// Verdict colors, resolved from the theme's semantic palette via CSS variables
// so they stay on-brand and scheme-aware (threat→tertiary, allowed→info,
// success→success, normal→primary, flagged→warning). Used for the node accent,
// wire, legend dot, and flow dot.
export const SEV_COLORS: Record<Severity, string> = {
  info: "var(--dnsf-palette-primary-main)",
  allowed: "var(--dnsf-palette-info-main)",
  success: "var(--dnsf-palette-success-main)",
  warning: "var(--dnsf-palette-warning-main)",
  threat: "var(--dnsf-palette-tertiary-main)",
};

export const LEGEND: { label: string; sev: Severity }[] = [
  { label: "Normal activity", sev: "info" },
  { label: "Allowed by policy", sev: "allowed" },
  { label: "Flagged / suspicious", sev: "warning" },
  { label: "Blocked threat", sev: "threat" },
];

export const CLIENTS: ClientInfo[] = [
  {
    id: "benign",
    name: "Castellanos-MBP14",
    user: "Maya Castellanos",
    status: "Normal activity",
    tone: "ok",
  },
  {
    id: "rogue",
    name: "WS-DEV-031",
    user: "Kade Whitlock",
    status: "Threat detected",
    tone: "bad",
  },
];

export const DATE_PRESETS = [
  "Last 15 minutes",
  "Last hour",
  "Last 24 hours",
  "Last 7 days",
  "Custom range…",
];

export const DEFAULT_DATE_LABEL = "Jun 28, 2026 · 14:00 – 14:42";

const r = (k: string, v: string, mono = false): EventRow => ({ k, v, mono });

export const SCENARIOS: Record<ScenarioId, SecurityEvent[]> = {
  benign: [
    {
      cat: "Session",
      title: "Agent session started",
      icon: "play_circle",
      sev: "info",
      time: "14:02:11",
      summary: "Autonomous agent launched under the scheduled reporting job.",
      rows: [
        r("Agent", "acme-ops-copilot v2.4"),
        r("Triggered by", "Scheduled task"),
        r("User", "maya.castellanos", true),
        r("Host", "Castellanos-MBP14", true),
        r("PID", "4821", true),
        r("Working dir", "/Users/maya/automation", true),
      ],
    },
    {
      cat: "File read",
      title: "Read sales_q2.csv",
      icon: "find_in_page",
      sev: "info",
      time: "14:02:13",
      summary: "Read structured sales data as input for aggregation.",
      rows: [
        r("Path", "/Users/maya/data/sales_q2.csv", true),
        r("Operation", "open() · read"),
        r("Size", "2.4 MB"),
        r("Bytes read", "2,418,944", true),
        r("Result", "Success"),
        r("Permissions", "rw-r--r--", true),
      ],
    },
    {
      cat: "Process",
      title: "Executed aggregate.py",
      icon: "terminal",
      sev: "info",
      time: "14:02:14",
      summary: "Ran a signed internal script to summarize the dataset.",
      rows: [
        r("Command", "python3 aggregate.py --period q2", true),
        r("PID", "4833", true),
        r("Parent PID", "4821", true),
        r("Duration", "1.8s"),
        r("Exit code", "0", true),
        r("Code signature", "Valid · corp-cert"),
      ],
    },
    {
      cat: "DNS lookup",
      title: "Resolved api.internal.acme.com",
      icon: "dns",
      sev: "allowed",
      time: "14:02:16",
      summary: "DNS lookup for the internal reporting API — permitted by policy.",
      rows: [
        r("Query type", "A"),
        r("Domain", "api.internal.acme.com", true),
        r("Resolver", "DNSFilter"),
        r("Category", "Business · Internal"),
        r("Verdict", "Allowed"),
        r("Resolved IP", "10.4.18.22", true),
      ],
    },
    {
      cat: "Network",
      title: "Uploaded report payload",
      icon: "north_east",
      sev: "allowed",
      time: "14:02:17",
      summary: "Posted the generated summary to the internal reporting service.",
      rows: [
        r("Endpoint", "api.internal.acme.com:443", true),
        r("Method", "POST /v1/reports", true),
        r("Payload", "418 KB"),
        r("Encryption", "TLS 1.3"),
        r("Verdict", "Allowed"),
      ],
    },
    {
      cat: "File write",
      title: "Wrote q2_summary.pdf",
      icon: "note_add",
      sev: "success",
      time: "14:02:18",
      summary: "Saved the finished report to the local reports folder.",
      rows: [
        r("Path", "/Users/maya/reports/q2_summary.pdf", true),
        r("Operation", "create · write"),
        r("Size", "612 KB"),
        r("Result", "Success"),
      ],
    },
    {
      cat: "Session",
      title: "Session completed cleanly",
      icon: "check_circle",
      sev: "success",
      time: "14:02:19",
      summary: "Agent finished its task with no policy violations.",
      rows: [
        r("Total duration", "42s"),
        r("Actions taken", "6"),
        r("Files touched", "2"),
        r("Network calls", "1"),
        r("Verdict", "No threats detected"),
      ],
    },
  ],
  rogue: [
    {
      cat: "Session",
      title: "Agent session started",
      icon: "play_circle",
      sev: "info",
      time: "09:41:03",
      summary: "Agent launched interactively inside a developer workspace.",
      rows: [
        r("Agent", "dev-assistant v1.9 · unsigned"),
        r("Triggered by", "Interactive prompt"),
        r("User", "kade.whitlock", true),
        r("Host", "WS-DEV-031", true),
        r("PID", "7720", true),
        r("Working dir", "/home/kade/project", true),
      ],
    },
    {
      cat: "File read",
      title: "Read project config",
      icon: "description",
      sev: "info",
      time: "09:41:05",
      summary: "Read the project environment file.",
      rows: [
        r("Path", "/home/kade/project/.env", true),
        r("Operation", "open() · read"),
        r("Result", "Success"),
        r("Contains", "12 keys"),
      ],
    },
    {
      cat: "Process",
      title: "Executed setup.sh",
      icon: "terminal",
      sev: "info",
      time: "09:41:07",
      summary: "Ran an unsigned setup script.",
      rows: [
        r("Command", "bash setup.sh", true),
        r("PID", "7731", true),
        r("Exit code", "0", true),
        r("Code signature", "Unsigned"),
      ],
    },
    {
      cat: "Credential access",
      title: "Accessed cloud credentials",
      icon: "vpn_key",
      sev: "warning",
      time: "09:41:12",
      summary:
        "Agent read long-lived cloud credentials unrelated to its task.",
      threat: "Suspicious",
      rows: [
        r("Path", "~/.aws/credentials", true),
        r("Operation", "open() · read"),
        r("Sensitivity", "High · secret material"),
        r("Result", "Success"),
        r("Flag", "Off-task credential access"),
      ],
    },
    {
      cat: "Privilege",
      title: "Privilege escalation",
      icon: "admin_panel_settings",
      sev: "warning",
      time: "09:41:15",
      summary:
        "Attempted to elevate privileges and copy a protected system file.",
      threat: "High",
      rows: [
        r("Command", "sudo cp /etc/shadow /tmp/.x", true),
        r("Method", "sudo (NOPASSWD)"),
        r("PID", "7740", true),
        r("Result", "Granted"),
        r("Flag", "Unexpected elevation"),
      ],
    },
    {
      cat: "Process",
      title: "Staged data archive",
      icon: "inventory_2",
      sev: "warning",
      time: "09:41:22",
      summary:
        "Compressed project files and secrets into a hidden staging archive.",
      threat: "High",
      rows: [
        r("Command", "tar czf /tmp/.cache/a.tgz ~/project ~/.aws", true),
        r("Output size", "1.2 GB"),
        r("PID", "7755", true),
        r("Flag", "Bulk data staging"),
      ],
    },
    {
      cat: "DNS lookup",
      title: "Resolved exfil-node-42.ddns.net",
      icon: "gpp_bad",
      sev: "threat",
      time: "09:41:24",
      summary:
        "DNS request to a known command-and-control domain — blocked by DNSFilter.",
      threat: "Critical",
      rows: [
        r("Query type", "A"),
        r("Domain", "exfil-node-42.ddns.net", true),
        r("Resolver", "DNSFilter"),
        r("Category", "Malware · C2"),
        r("Verdict", "BLOCKED"),
        r("Threat feed", "Newly-seen domain"),
      ],
    },
    {
      cat: "Network",
      title: "Blocked exfiltration attempt",
      icon: "block",
      sev: "threat",
      time: "09:41:24",
      summary:
        "Outbound transfer of the staged archive was prevented at the network layer.",
      threat: "Critical",
      rows: [
        r("Destination", "185.220.101.44:443", true),
        r("Method", "POST /upload", true),
        r("Payload", "1.2 GB attempted"),
        r("Verdict", "BLOCKED · no route"),
        r("Reason", "Resolution denied"),
      ],
    },
    {
      cat: "Session",
      title: "Session quarantined",
      icon: "dangerous",
      sev: "threat",
      time: "09:41:25",
      summary:
        "Secure Shield isolated the client and terminated the agent session.",
      threat: "Critical",
      rows: [
        r("Action", "Agent terminated"),
        r("Client status", "Quarantined"),
        r("Triggered by", "DNSFilter Secure Shield"),
        r("Analyst alert", "Sent · SOC"),
        r("Verdict", "Active threat contained"),
      ],
    },
  ],
};

// Geometry for laying nodes out along the horizontal timeline.
export const NODE_W = 264;
export const NODE_H = 88;
export const GAP_X = 300;
export const ORIGIN_X = 24;
export const ORIGIN_Y = 24;
