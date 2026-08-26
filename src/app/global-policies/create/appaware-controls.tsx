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
  Chip,
  Divider,
  InputAdornment,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useLayoutEffect, useRef, useState } from "react";

import { DataTable } from "@/components/data-table";
import { DataTableBulkActions } from "@/components/data-table-bulk-actions";
import { MaterialSymbol } from "@/components/material-symbol";
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

/** The rail's first entry: every app in the catalog, whatever its category. */
const ALL = "all";

/**
 * A rail tile. Matches the widget selector in the Manage Widgets drawer, so
 * selection reads the same across the app.
 */
const tileSx = (active: boolean) => (theme: Theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  px: 1.5,
  py: 1.5,
  cursor: "pointer",
  border: "1px solid",
  borderColor: active ? "primary.main" : "divider",
  borderRadius: 1,
  bgcolor: active
    ? alpha(theme.palette.primary.main, 0.08)
    : "background.paper",
  transition: "border-color 120ms, background 120ms",
  "&:hover": {
    bgcolor: alpha(theme.palette.primary.main, active ? 0.12 : 0.04),
  },
  ...theme.applyStyles("dark", {
    borderColor: active
      ? theme.vars.palette.primary.light
      : theme.vars.palette.divider,
  }),
});

/** Which category an app belongs to — the All Apps grid needs it per row. */
const CATEGORY_OF: Record<string, AppCategory> = Object.fromEntries(
  CATEGORIES.flatMap((c) => c.apps.map((a) => [a, c] as const)),
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

/** The state a category reads as, in one chip. */
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
  // An override in either direction makes the category mixed.
  const state: State = allowExceptions || appBlocks ? "mixed" : policy;
  // How many apps actually end up blocked: a blocked category blocks all but
  // its allow exceptions, an allowed one blocks only its app-level blocks.
  const blocked =
    policy === "block" ? category.apps.length - allowExceptions : appBlocks;
  return {
    state,
    allowExceptions,
    appBlocks,
    blocked,
    total: category.apps.length,
  };
}

/**
 * The category's state as a chip, styled like the Result column's chips in the
 * DNS Query Log: allowed reads as a check, blocked as a block, and a category
 * with overrides in either direction as a do-not-disturb.
 */
function StateChip({ state }: { state: State }) {
  const { label, icon } =
    state === "allow"
      ? { label: "Allowed", icon: "check" }
      : state === "block"
        ? { label: "Blocked", icon: "block" }
        : { label: "Mixed", icon: "do_not_disturb_on" };
  return (
    <Chip
      size="small"
      icon={<MaterialSymbol name={icon} size={16} />}
      label={label}
      sx={(theme) => {
        const tone =
          state === "allow"
            ? {
                bg: theme.vars.palette.Alert.successStandardBg,
                fg: theme.vars.palette.Alert.successColor,
              }
            : state === "block"
              ? {
                  bg: theme.vars.palette.Alert.errorStandardBg,
                  fg: theme.vars.palette.Alert.errorColor,
                }
              : {
                  bg: theme.vars.palette.Alert.warningStandardBg,
                  fg: theme.vars.palette.Alert.warningColor,
                };
        return {
          borderRadius: "6px",
          flexShrink: 0,
          bgcolor: tone.bg,
          color: tone.fg,
          "& .MuiChip-icon, & .MuiChip-label": { color: "inherit" },
        };
      }}
    />
  );
}

/**
 * Sizes the grid card to its content, but never past the space on offer.
 *
 * CSS alone can't do this here. The card has to hug when the rows are short and
 * be a *definite* height when they aren't — the grid measures itself against
 * its parent, and without a definite height it grows past the card and its own
 * pagination footer gets clipped. `fit-content`, `max-height`, and
 * `min(100%, max-content)` all collapse to the content height in both cases.
 *
 * So measure instead: everything but the scrolling rows is fixed chrome (policy
 * header, search, column headers, pager), and the grid publishes its full rows
 * height on the virtual scroller's content node. Their sum is what the card
 * wants; the container's height is the ceiling.
 */
function useContentHeight() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const card = cardRef.current;
    const container = card?.parentElement;
    if (!card || !container) return;

    let watched: Element | null = null;

    const measure = () => {
      const scroller = card.querySelector<HTMLElement>(
        ".MuiDataGrid-virtualScroller",
      );
      const rows = card.querySelector<HTMLElement>(
        ".MuiDataGrid-virtualScrollerContent",
      );
      if (!scroller || !rows) return;
      // Re-point the observer if the grid swapped the node out.
      if (watched !== rows) {
        if (watched) observer.unobserve(watched);
        observer.observe(rows);
        watched = rows;
      }
      // Invariant of the card's own height, so this can't oscillate.
      const chrome = card.clientHeight - scroller.clientHeight;
      setHeight(Math.min(container.clientHeight, chrome + rows.offsetHeight));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(card);
    measure();
    return () => observer.disconnect();
  }, []);

  return { cardRef, height };
}

export function AppAwareControls() {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [railQuery, setRailQuery] = useState("");
  const [appQuery, setAppQuery] = useState("");
  const { cardRef, height: cardHeight } = useContentHeight();
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [policies, setPolicies] =
    useState<Record<string, Policy>>(DEFAULT_POLICIES);
  const [autoBlock, setAutoBlock] =
    useState<Record<string, boolean>>(DEFAULT_AUTO_BLOCK);
  const [rules, setRules] = useState<Record<string, Policy>>(DEFAULT_RULES);

  // All Apps has no category policy of its own — it's a flat view of the
  // catalog, so the per-category controls sit this one out.
  const showingAll = selectedCat === ALL;
  const category =
    CATEGORIES.find((c) => c.id === selectedCat) ?? CATEGORIES[0];
  const policy = policies[category.id];
  const summary = summarize(category, policy, rules);

  const railMatches = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(railQuery.trim().toLowerCase()),
  );
  const scopedApps = showingAll
    ? CATEGORIES.flatMap((c) => c.apps)
    : category.apps;
  const visibleApps = scopedApps.filter((a) =>
    a.toLowerCase().includes(appQuery.trim().toLowerCase()),
  );
  const clearSelection = () =>
    setRowSelection({ type: "include", ids: new Set() });

  /** The policy an app falls under, whichever category owns it. */
  const policyOf = (app: string) => policies[CATEGORY_OF[app].id];

  // One row per app, keyed by name — that's what the rules map is keyed on too.
  const rows = visibleApps.map((app) => ({
    id: app,
    application: app,
    category: CATEGORY_OF[app].name,
  }));

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
  // Only reachable from a category — All Apps hides these controls.
  const setCategoryPolicy = (value: Policy) => {
    setRules((prev) => {
      const next = { ...prev };
      for (const app of category.apps) delete next[app];
      return next;
    });
    setPolicies((prev) => ({ ...prev, [category.id]: value }));
    clearSelection();
  };

  // Same rule as the per-row toggle: an app that lands back on its category's
  // own policy drops its rule instead of pinning a redundant one, so the
  // override counts stay honest.
  const bulk = (value: Policy) => {
    setRules((prev) => {
      const next = { ...prev };
      for (const app of selectedApps) {
        if (value === policies[CATEGORY_OF[app].id]) delete next[app];
        else next[app] = value;
      }
      return next;
    });
    clearSelection();
  };

  // Application, and what you can do to it — plus which category it falls
  // under when the grid isn't already scoped to one.
  const columns: GridColDef[] = [
    {
      field: "application",
      headerName: "Application",
      flex: 1,
      minWidth: 220,
    },
    ...(showingAll
      ? [
          {
            field: "category",
            headerName: "Category",
            flex: 1,
            minWidth: 180,
          } satisfies GridColDef,
        ]
      : []),
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      filterable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const app = params.id as string;
        // The switch reads the app's effective state: its own rule if it has
        // one, otherwise whatever its category says.
        const blocked = (rules[app] ?? policyOf(app)) === "block";
        return (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", height: "100%" }}
          >
            <Switch
              size="small"
              checked={blocked}
              onChange={(e) => {
                const next: Policy = e.target.checked ? "block" : "allow";
                // Landing back on the category's own policy drops the app
                // rule rather than pinning a redundant one.
                setRule([app], next === policyOf(app) ? null : next);
              }}
            />
            <Typography variant="body2">Block</Typography>
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
        // The row is pinned to the container's height so the cards have
        // something definite to size against.
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
          height: "fit-content",
          maxHeight: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
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

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* All Apps sits above the categories, separated by a rule — it's a
              flat view of the catalog rather than one of the categories. */}
          <Box
            onClick={() => {
              setSelectedCat(ALL);
              clearSelection();
              setAppQuery("");
            }}
            sx={tileSx(showingAll)}
          >
            <Typography
              noWrap
              variant="body1"
              sx={{ fontWeight: showingAll ? 600 : 500 }}
            >
              All Apps
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {railMatches.map((c) => {
              const active = !showingAll && c.id === category.id;
              const sum = summarize(c, policies[c.id], rules);
              return (
                <Box
                  key={c.id}
                  onClick={() => {
                    setSelectedCat(c.id);
                    clearSelection();
                    setAppQuery("");
                  }}
                  sx={tileSx(active)}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
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
                            sx={{
                              fontSize: 20,
                              flexShrink: 0,
                              color: "primary.main",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <StateChip state={sum.state} />
                </Box>
              );
            })}
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            px: 2,
            py: 1.5,
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
        ref={cardRef}
        sx={{
          gridColumn: { md: "span 2" },
          height: cardHeight ?? "100%",
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
            flexShrink: 0,
            px: 2,
            py: 1.5,
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography variant="cardTitle">
                {showingAll ? "All Apps" : category.name}
              </Typography>
              {!showingAll && category.note && (
                <Tooltip title={category.note} placement="top">
                  <InfoOutlinedIcon
                    sx={{ fontSize: 20, color: "primary.main" }}
                  />
                </Tooltip>
              )}
            </Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {showingAll
                ? `${TOTAL_APPS.toLocaleString()} apps · ${CATEGORIES.length} categories`
                : [
                    summary.allowExceptions > 0 &&
                      `${summary.allowExceptions} allow override${summary.allowExceptions > 1 ? "s" : ""}`,
                    // Always states the ratio, so a category with nothing
                    // blocked reads 0 / N rather than going silent.
                    `${summary.blocked.toLocaleString()} / ${summary.total.toLocaleString()} blocked`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
            </Typography>
            {/* Block all sets a *category* policy, so it only belongs to a
                category. */}
            {!showingAll && (
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <Switch
                  size="small"
                  checked={policy === "block"}
                  onChange={(e) =>
                    setCategoryPolicy(e.target.checked ? "block" : "allow")
                  }
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Block all
                </Typography>
              </Box>
            )}
          </Box>

          {!showingAll && (
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
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Block new apps as they&apos;re added to this category
              </Typography>
            </Box>
          )}
        </Box>

        {/* The app list is a standard grid: search above the header, the
            application and its actions as columns — plus the category it falls
            under in the All Apps view — and the pager below. */}
        <DataTable
          rows={rows}
          columns={columns}
          fillHeight
          stretchGrid
          initialPageSize={25}
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
          getRowClassName={(params) => {
            const app = params.id as string;
            return rules[app] === "allow" && policyOf(app) === "block"
              ? "row--exception"
              : "";
          }}
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
                      color="error"
                      onClick={() => bulk("block")}
                    >
                      Block
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => bulk("allow")}
                    >
                      Unblock
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
