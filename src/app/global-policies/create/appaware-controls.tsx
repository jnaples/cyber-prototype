// AppAware controls — the master–detail split from the design explorations
// ("AppAware Controls Explorations", the turn-2 prototype of 1c).
//
// Categories are the spine: the rail carries each category's policy and how
// many apps override it, and the pane lists that category's apps with the
// effective state spelled out per row. A category policy is the default; an
// app rule overrides it, and Reset drops the app back to the category.

import {
  Box,
  Button,
  Card,
  Checkbox,
  InputAdornment,
  Switch,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

import { TextField } from "@/components/text-field";

type Policy = "allow" | "block";

type Category = { id: string; name: string; apps: string[] };

const CATEGORIES: Category[] = [
  {
    id: "genai",
    name: "Generative AI",
    apps: [
      "ChatGPT",
      "Claude",
      "Gemini",
      "Midjourney",
      "Perplexity",
      "GitHub Copilot",
      "Jasper",
      "Runway",
      "Character.AI",
      "Stable Diffusion",
      "DALL·E",
      "Copy.ai",
      "Writesonic",
      "Synthesia",
      "ElevenLabs",
      "Hugging Face",
      "Poe",
      "You.com",
      "Phind",
      "Leonardo.AI",
      "Luma AI",
      "Pika",
      "Suno",
      "Udio",
      "NotebookLM",
      "Replika",
      "Otter.ai",
      "DeepL Write",
      "QuillBot",
      "Tome",
      "Gamma",
      "Descript",
      "Kapwing",
      "Grammarly AI",
    ],
  },
  {
    id: "social",
    name: "Social Media",
    apps: [
      "Facebook",
      "Instagram",
      "TikTok",
      "LinkedIn",
      "Reddit",
      "Snapchat",
      "Pinterest",
      "Threads",
      "X",
      "Mastodon",
      "Bluesky",
      "Tumblr",
    ],
  },
  {
    id: "stream",
    name: "Streaming Media",
    apps: [
      "YouTube",
      "Netflix",
      "Spotify",
      "Twitch",
      "Hulu",
      "Disney+",
      "Vimeo",
      "SoundCloud",
      "Pandora",
      "Apple TV",
    ],
  },
  {
    id: "collab",
    name: "Collaboration",
    apps: [
      "Slack",
      "Zoom",
      "Microsoft Teams",
      "Notion",
      "Miro",
      "Figma",
      "Asana",
      "Trello",
      "Google Chat",
      "Webex",
    ],
  },
  {
    id: "files",
    name: "File Sharing",
    apps: [
      "Dropbox",
      "WeTransfer",
      "Mega",
      "Box",
      "Google Drive",
      "OneDrive",
      "pCloud",
      "MediaFire",
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    apps: [
      "Steam",
      "Roblox",
      "Epic Games",
      "Xbox Live",
      "PlayStation Network",
      "Discord",
      "Battle.net",
      "Riot Games",
      "Minecraft",
      "Twitch Drops",
      "GeForce Now",
      "Itch.io",
    ],
  },
  {
    id: "vpn",
    name: "VPN & Proxy",
    apps: [
      "NordVPN",
      "ExpressVPN",
      "Tor Browser",
      "Psiphon",
      "Hola VPN",
      "ProtonVPN",
      "Windscribe",
      "TunnelBear",
    ],
  },
  {
    id: "prod",
    name: "Productivity",
    apps: [
      "Canva",
      "Evernote",
      "Todoist",
      "Airtable",
      "Calendly",
      "Loom",
      "Zapier",
      "IFTTT",
      "Monday.com",
      "ClickUp",
    ],
  },
  {
    id: "msg",
    name: "Messaging",
    apps: [
      "WhatsApp",
      "Telegram",
      "Signal",
      "Messenger",
      "WeChat",
      "Line",
      "Viber",
      "Kik",
      "GroupMe",
      "Skype",
    ],
  },
];

const DEFAULT_POLICIES: Record<string, Policy> = {
  genai: "block",
  social: "allow",
  stream: "allow",
  collab: "allow",
  files: "allow",
  gaming: "block",
  vpn: "block",
  prod: "allow",
  msg: "allow",
};

const DEFAULT_AUTO_BLOCK: Record<string, boolean> = {
  genai: true,
  gaming: true,
  vpn: true,
};

// The app rules that already override their category, as the design ships it.
const DEFAULT_RULES: Record<string, Policy> = {
  ChatGPT: "allow",
  "GitHub Copilot": "allow",
  TikTok: "block",
  Snapchat: "block",
  LinkedIn: "allow",
  Dropbox: "block",
};

// Avatar tints cycle through the brand ramps.
const AVATARS = [
  "#059692",
  "#9435EC",
  "#C32E54",
  "#238CD2",
  "#F57C00",
  "#492BFF",
  "#037C78",
  "#6A0CDB",
  "#AF2A51",
  "#207BBE",
];

const TOTAL_APPS = CATEGORIES.reduce((n, c) => n + c.apps.length, 0);

/** How a category reads in the rail: its policy, plus any app overrides. */
function summarize(
  category: Category,
  policy: Policy,
  rules: Record<string, Policy>,
) {
  let allowExceptions = 0;
  let appBlocks = 0;
  for (const app of category.apps) {
    const rule = rules[app];
    if (rule === "allow" && policy === "block") allowExceptions += 1;
    if (rule === "block" && policy === "allow") appBlocks += 1;
  }
  const base = policy === "block" ? "Blocked" : "Allowed";
  const parts = [
    allowExceptions > 0 &&
      `${allowExceptions} allow exception${allowExceptions > 1 ? "s" : ""}`,
    appBlocks > 0 && `${appBlocks} app block${appBlocks > 1 ? "s" : ""}`,
  ].filter(Boolean);
  return {
    allowExceptions,
    appBlocks,
    text: parts.length ? `${base} · ${parts.join(" · ")}` : base,
  };
}

/** A small state dot. */
function Dot({ color }: { color: string }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: color,
        flexShrink: 0,
      }}
    />
  );
}

export function AppAwareControls() {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [railQuery, setRailQuery] = useState("");
  const [appQuery, setAppQuery] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [policies, setPolicies] =
    useState<Record<string, Policy>>(DEFAULT_POLICIES);
  const [autoBlock, setAutoBlock] =
    useState<Record<string, boolean>>(DEFAULT_AUTO_BLOCK);
  const [rules, setRules] = useState<Record<string, Policy>>(DEFAULT_RULES);

  const category =
    CATEGORIES.find((c) => c.id === selectedCat) ?? CATEGORIES[0];
  const policy = policies[category.id];
  const summary = summarize(category, policy, rules);

  const railMatches = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(railQuery.trim().toLowerCase()),
  );
  const visibleApps = category.apps.filter((a) =>
    a.toLowerCase().includes(appQuery.trim().toLowerCase()),
  );
  const selected = Object.keys(checked).filter((k) => checked[k]);
  const allChecked =
    visibleApps.length > 0 && visibleApps.every((a) => checked[a]);

  /** Set — or with `null`, clear — an app rule for each named app. */
  const setRule = (names: string[], value: Policy | null) =>
    setRules((prev) => {
      const next = { ...prev };
      for (const name of names) {
        if (value) next[name] = value;
        else delete next[name];
      }
      return next;
    });

  // Setting a category policy is a fresh start: the app rules under it go.
  const setCategoryPolicy = (value: Policy) => {
    setRules((prev) => {
      const next = { ...prev };
      for (const app of category.apps) delete next[app];
      return next;
    });
    setPolicies((prev) => ({ ...prev, [category.id]: value }));
    setChecked({});
  };

  const bulk = (value: Policy | null) => {
    setRule(selected, value);
    setChecked({});
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "290px 1fr" },
        alignItems: "start",
        gap: 2,
      }}
    >
      {/* CATEGORY RAIL — each category's policy and how many apps override it. */}
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          height: 640,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Filter categories…"
            value={railQuery}
            onChange={(e) => setRailQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {railMatches.map((c) => {
            const active = c.id === category.id;
            const sum = summarize(c, policies[c.id], rules);
            const dot =
              policies[c.id] === "block"
                ? "error.main"
                : sum.allowExceptions || sum.appBlocks
                  ? "warning.main"
                  : "success.main";
            return (
              <Box
                key={c.id}
                onClick={() => {
                  setSelectedCat(c.id);
                  setChecked({});
                  setAppQuery("");
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 1.75,
                  py: 1.25,
                  cursor: "pointer",
                  borderLeft: "3px solid",
                  borderLeftColor: active ? "primary.main" : "transparent",
                  bgcolor: active ? "action.selected" : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Dot color={dot} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{ fontSize: 13, fontWeight: active ? 600 : 500 }}
                  >
                    {c.name}
                  </Typography>
                  <Typography
                    noWrap
                    sx={{ fontSize: 11, color: "text.secondary" }}
                  >
                    {sum.text}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                  {c.apps.length}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            px: 1.75,
            py: 1.25,
            borderTop: "1px solid",
            borderColor: "divider",
            fontSize: 11,
            color: "text.secondary",
          }}
        >
          {railMatches.length} categories · {TOTAL_APPS.toLocaleString()} apps
        </Box>
      </Card>

      {/* DETAIL PANE */}
      <Card
        sx={{
          height: 640,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* The policy header stays put while the app list scrolls under it. */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 5 }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "background.neutral",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={(theme) => ({
                  fontFamily: theme.typography.fontSecondaryFamily,
                  fontWeight: 600,
                  fontSize: 15,
                })}
              >
                {category.name}
              </Typography>
              <Box
                sx={(theme: Theme) => {
                  const tone =
                    policy === "block"
                      ? theme.palette.error
                      : theme.palette.success;
                  return {
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    color: tone.main,
                    bgcolor: alpha(tone.main, 0.12),
                  };
                }}
              >
                {policy === "block" ? "Blocked" : "Allowed"}
              </Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {summary.allowExceptions || summary.appBlocks
                  ? [
                      summary.allowExceptions > 0 &&
                        `${summary.allowExceptions} allow override${summary.allowExceptions > 1 ? "s" : ""}`,
                      summary.appBlocks > 0 &&
                        `${summary.appBlocks} app block${summary.appBlocks > 1 ? "s" : ""}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : "No app rules"}
              </Typography>
              <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={() => setCategoryPolicy("allow")}
                >
                  Allow all
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => setCategoryPolicy("block")}
                >
                  Block all
                </Button>
              </Box>
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <Switch
                size="small"
                checked={Boolean(autoBlock[category.id])}
                onChange={(e) =>
                  setAutoBlock((prev) => ({
                    ...prev,
                    [category.id]: e.target.checked,
                  }))
                }
              />
              <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                Block new apps as they&apos;re added to this category
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {autoBlock[category.id]
                  ? "· On — new apps here start Blocked"
                  : "· Off — new apps follow policy default"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 2,
              py: 1,
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Checkbox
              size="small"
              checked={allChecked}
              indeterminate={!allChecked && selected.length > 0}
              onChange={() =>
                setChecked(
                  allChecked
                    ? {}
                    : Object.fromEntries(visibleApps.map((a) => [a, true])),
                )
              }
              sx={{ p: 0.5 }}
            />
            <TextField
              size="small"
              placeholder={`Search in ${category.name}…`}
              value={appQuery}
              onChange={(e) => setAppQuery(e.target.value)}
              sx={{ maxWidth: 280, flex: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Typography
              sx={{ ml: "auto", fontSize: 11, color: "text.secondary" }}
            >
              {visibleApps.length} of {category.apps.length} apps
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          {visibleApps.map((app) => {
            const rule = rules[app];
            const effective: Policy = rule ?? policy;
            // The case worth seeing at a glance: allowed despite the category.
            const isException = rule === "allow" && policy === "block";
            const isChecked = Boolean(checked[app]);
            const state = isException
              ? {
                  text: "Exception — allowed over category block",
                  color: "success.main",
                  weight: 600,
                }
              : rule === "allow"
                ? {
                    text: "Allowed · app rule",
                    color: "success.main",
                    weight: 600,
                  }
                : rule === "block"
                  ? {
                      text: "Blocked · app rule",
                      color: "error.main",
                      weight: 600,
                    }
                  : {
                      text: `${policy === "block" ? "Blocked" : "Allowed"} via category`,
                      color: "text.secondary",
                      weight: 400,
                    };
            return (
              <Box
                key={app}
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 2,
                  py: 0.75,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: isChecked
                    ? "action.selected"
                    : isException
                      ? alpha(theme.palette.success.main, 0.08)
                      : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                })}
              >
                <Checkbox
                  size="small"
                  checked={isChecked}
                  onChange={() =>
                    setChecked((prev) => ({ ...prev, [app]: !prev[app] }))
                  }
                  sx={{ p: 0.5 }}
                />
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: 1,
                    flexShrink: 0,
                    bgcolor:
                      AVATARS[category.apps.indexOf(app) % AVATARS.length],
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: "22px",
                    textAlign: "center",
                  }}
                >
                  {app[0].toUpperCase()}
                </Box>
                <Typography
                  noWrap
                  sx={{ width: 180, fontSize: 13, fontWeight: 500 }}
                >
                  {app}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Dot
                    color={
                      effective === "allow" ? "success.main" : "error.main"
                    }
                  />
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 11,
                      fontWeight: state.weight,
                      color: state.color,
                    }}
                  >
                    {state.text}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    ml: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    flexShrink: 0,
                  }}
                >
                  <Button
                    size="small"
                    variant={rule === "allow" ? "contained" : "outlined"}
                    color="success"
                    onClick={() => setRule([app], "allow")}
                  >
                    Allow
                  </Button>
                  <Button
                    size="small"
                    variant={rule === "block" ? "contained" : "outlined"}
                    color="error"
                    onClick={() => setRule([app], "block")}
                  >
                    Block
                  </Button>
                  {/* Only a rule can be reset — without one the row already
                      follows the category. */}
                  {rule && (
                    <Button
                      size="small"
                      variant="text"
                      color="secondary"
                      onClick={() => setRule([app], null)}
                    >
                      Reset
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}

          {visibleApps.length === 0 && (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No apps match &quot;{appQuery}&quot; in {category.name}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bulk bar — rides the bottom of the pane while rows are checked. */}
        {selected.length > 0 && (
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              display: "flex",
              alignItems: "center",
              gap: 1.75,
              px: 2,
              py: 1.25,
              bgcolor: "grey.900",
              color: "common.white",
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
              {selected.length} selected
            </Typography>
            <Button size="small" color="success" onClick={() => bulk("allow")}>
              Allow
            </Button>
            <Button size="small" color="error" onClick={() => bulk("block")}>
              Block
            </Button>
            <Button
              size="small"
              sx={{ color: "rgba(255,255,255,0.7)" }}
              onClick={() => bulk(null)}
            >
              Reset to category
            </Button>
            <Button
              size="small"
              onClick={() => setChecked({})}
              sx={{ ml: "auto", color: "rgba(255,255,255,0.6)" }}
            >
              Clear ✕
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}
