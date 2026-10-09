// AgentShield → the fields the Filters drawer offers, grouped by what each one
// narrows: where the traffic came from, which application made it, and what
// happened to it.

/** One field in the drawer: what it narrows, and what it can be set to. */
type Field = {
  key: string;
  label: string;
  /** What "no choice" reads as in the field. */
  all: string;
  options: string[];
};

type Group = { title: string; fields: Field[] };

export const FILTER_GROUPS: Group[] = [
  {
    title: "Source",
    fields: [
      {
        key: "organizations",
        label: "Organizations",
        all: "All Organizations",
        options: ["Bright Future Pediatrics", "Acme Inc.", "Globex"],
      },
      {
        key: "sites",
        label: "Sites",
        all: "All Sites",
        options: ["HQ", "Warehouse", "Clinic North", "Clinic South"],
      },
      {
        key: "roamingClients",
        label: "Roaming Clients",
        all: "All Roaming Clients",
        options: ["WKS-4471", "WKS-3390", "LAP-2210", "WKS-0912", "LAP-1187"],
      },
      {
        key: "users",
        label: "Logged on Users",
        all: "All Users",
        options: [
          "k.trojanowski",
          "m.okafor",
          "d.reyes",
          "a.novak",
          "s.hall",
          "f.mancuso",
        ],
      },
    ],
  },
  {
    title: "AI Application",
    fields: [
      {
        key: "applications",
        label: "AI Applications",
        all: "All AI Applications",
        options: [
          "Claude Code",
          "Cursor",
          "GitHub Copilot",
          "ChatGPT Desktop",
          "Claude Desktop",
          "Windsurf",
        ],
      },
      {
        key: "status",
        label: "Status",
        all: "All",
        options: ["Unreviewed", "Approved", "Unapproved", "Blocked"],
      },
      {
        key: "signatureSource",
        label: "Signature Source",
        all: "All",
        options: [
          "DNSFilter Catalog",
          "Added manually",
          "Discovered on roaming client",
        ],
      },
      {
        key: "processName",
        label: "Process Name",
        all: "All",
        options: [
          "claude.exe",
          "node.exe",
          "Cursor.exe",
          "windsurf.exe",
          "ChatGPT.exe",
          "copilot.exe",
        ],
      },
    ],
  },
  {
    title: "Traffic",
    fields: [
      {
        key: "result",
        label: "Result",
        all: "All",
        options: ["Allowed", "Blocked"],
      },
    ],
  },
];
