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
  InputAdornment,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckIcon from "@mui/icons-material/Check";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

import { DataTable } from "@/components/data-table";
import { DataTableBulkActions } from "@/components/data-table-bulk-actions";
import { NoResultsOverlay } from "@/components/no-results-overlay";
import { TextField } from "@/components/text-field";
import type { AppCategory } from "@/data/appaware-apps";
import { APP_CATEGORIES, TOTAL_APPS } from "@/data/appaware-apps";

type Policy = "allow" | "block";

/**
 * The catalog lives in src/data/appaware-apps.ts — 2,400 apps across the 14
 * categories. Add or move apps there; the rail, search, and grid all follow.
 */
const CATEGORIES = APP_CATEGORIES;

// Everything is allowed by default except the categories a policy usually
// clamps down on; those also auto-block newly detected apps.
const BLOCKED_BY_DEFAULT = ["genai", "remote", "vpn"];

const DEFAULT_POLICIES: Record<string, Policy> = Object.fromEntries(
  CATEGORIES.map((c) => [
    c.id,
    BLOCKED_BY_DEFAULT.includes(c.id) ? "block" : "allow",
  ]),
);

const DEFAULT_AUTO_BLOCK: Record<string, boolean> = Object.fromEntries(
  BLOCKED_BY_DEFAULT.map((id) => [id, true]),
);

// The app rules that already override their category, as the design ships it.
const DEFAULT_RULES: Record<string, Policy> = {
  ChatGPT: "allow",
  "GitHub Copilot": "allow",
  "Microsoft Copilot": "allow",
  TeamViewer: "allow",
  "Chrome Remote Desktop": "allow",
  MEGA: "block",
  Snapchat: "block",
  Telegram: "block",
  BitTorrent: "block",
};

/** The state a category reads as, in one glyph. */
type State = "allow" | "block" | "mixed";

/** How a category reads in the rail: its policy, plus any app overrides. */
function summarize(
  category: AppCategory,
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
  // An override in either direction makes the category mixed, and the label
  // leads with the same word the icon says so the two never disagree.
  const state: State = allowExceptions || appBlocks ? "mixed" : policy;
  const base =
    state === "mixed" ? "Mixed" : policy === "block" ? "Blocked" : "Allowed";
  const parts = [
    allowExceptions > 0 &&
      `${allowExceptions} allow exception${allowExceptions > 1 ? "s" : ""}`,
    appBlocks > 0 && `${appBlocks} app block${appBlocks > 1 ? "s" : ""}`,
  ].filter(Boolean);
  return {
    state,
    allowExceptions,
    appBlocks,
    text: parts.length ? `${base} · ${parts.join(" · ")}` : base,
  };
}

/** Allowed reads as a check, blocked as a block, mixed as a do-not-disturb. */
function StateIcon({ state }: { state: State }) {
  const Icon =
    state === "allow"
      ? CheckIcon
      : state === "block"
        ? BlockOutlinedIcon
        : DoNotDisturbOnOutlinedIcon;
  const color =
    state === "allow"
      ? "success.main"
      : state === "block"
        ? "error.main"
        : "warning.main";
  return <Icon sx={{ fontSize: 20, color, flexShrink: 0 }} />;
}

export function AppAwareControls() {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [railQuery, setRailQuery] = useState("");
  const [appQuery, setAppQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
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
  const clearSelection = () =>
    setRowSelection({ type: "include", ids: new Set() });

  // One row per app, keyed by name — that's what the rules map is keyed on too.
  const rows = visibleApps.map((app) => ({ id: app, application: app }));

  // "Exclude" is the header checkbox's select-all, so it reads against the
  // rows the search left visible rather than the whole category.
  const selectedApps =
    rowSelection.type === "exclude"
      ? visibleApps.filter((a) => !rowSelection.ids.has(a))
      : visibleApps.filter((a) => rowSelection.ids.has(a));

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
    clearSelection();
  };

  const bulk = (value: Policy | null) => {
    setRule(selectedApps, value);
    clearSelection();
  };

  // Two columns: the application, and what you can do to it.
  const columns: GridColDef[] = [
    {
      field: "application",
      headerName: "Application",
      flex: 1,
      minWidth: 220,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 240,
      sortable: false,
      filterable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const app = params.id as string;
        const rule = rules[app];
        return (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", height: "100%" }}
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
          </Stack>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        // The row is pinned to the container so `maxHeight: 100%` on a card
        // resolves against the space available, while `start` lets a card that
        // needs less than that hug its own content.
        gridTemplateRows: "minmax(0, 1fr)",
        alignItems: "start",
        flex: 1,
        minHeight: 0,
        gap: 2,
      }}
    >
      {/* CATEGORY RAIL — each category's policy and how many apps override it. */}
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "100%",
          minHeight: 0,
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
            return (
              <Box
                key={c.id}
                onClick={() => {
                  setSelectedCat(c.id);
                  clearSelection();
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
                <StateIcon state={sum.state} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      noWrap
                      variant="body1"
                      sx={{ fontWeight: active ? 600 : 500 }}
                    >
                      {c.name}
                    </Typography>
                    {c.note && (
                      <Tooltip title={c.note} placement="top">
                        <InfoOutlinedIcon
                          sx={{ fontSize: 20, color: "primary.main" }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography
                    noWrap
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                  >
                    {sum.text}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {c.apps.length}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Typography
          variant="body2"
          sx={{
            px: 1.75,
            py: 1.25,
            borderTop: "1px solid",
            borderColor: "divider",
            color: "text.secondary",
          }}
        >
          {railMatches.length} categories · {TOTAL_APPS.toLocaleString()} apps
        </Typography>
      </Card>

      {/* DETAIL PANE */}
      <Card
        sx={{
          gridColumn: { md: "span 2" },
          maxHeight: "100%",
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* The policy header sits above the grid; the rows scroll inside it. */}
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
            <Typography variant="cardTitle">{category.name}</Typography>
            {category.note && (
              <Tooltip title={category.note} placement="top">
                <InfoOutlinedIcon
                  sx={{ fontSize: 20, color: "primary.main" }}
                />
              </Tooltip>
            )}
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
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
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Block new apps as they&apos;re added to this category
            </Typography>
          </Box>
        </Box>

        {/* The app list is a standard grid: search above the header, one
            column for the application and one for its actions, pager below. */}
        <DataTable
          rows={rows}
          columns={columns}
          fillHeight
          initialPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          showFilters={false}
          showDefaultView={false}
          showPreferences={false}
          showExport={false}
          showRefresh={false}
          onSearchChange={setAppQuery}
          noRowsOverlay={NoResultsOverlay}
          rowSelectionModel={rowSelection}
          onRowSelectionModelChange={setRowSelection}
          // Allowed despite a category block is the case worth spotting.
          getRowClassName={(params) =>
            rules[params.id as string] === "allow" && policy === "block"
              ? "row--exception"
              : ""
          }
          sx={(theme) => ({
            "& .row--exception": {
              bgcolor: alpha(theme.palette.success.main, 0.08),
            },
          })}
          bulkActions={
            selectedApps.length > 0 && (
              <DataTableBulkActions
                count={selectedApps.length}
                noun="app"
                onClose={clearSelection}
                actions={
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => bulk("allow")}
                    >
                      Allow
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => bulk("block")}
                    >
                      Block
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="secondary"
                      onClick={() => bulk(null)}
                    >
                      Reset to category
                    </Button>
                  </Stack>
                }
              />
            )
          }
        />
      </Card>
    </Box>
  );
}
