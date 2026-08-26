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
import type { Dispatch, SetStateAction } from "react";
import { useLayoutEffect, useRef, useState } from "react";

import { DataTable } from "@/components/data-table";
import { DataTableBulkActions } from "@/components/data-table-bulk-actions";
import { MaterialSymbol } from "@/components/material-symbol";
import { NoResultsOverlay } from "@/components/no-results-overlay";
import { TextField } from "@/components/text-field";
import type { AppCategory } from "@/data/appaware-apps";
import { TOTAL_APPS } from "@/data/appaware-apps";
import { logoUrl } from "@/data/appaware-logos";

import type { AppAwareState, Policy } from "./appaware-state";
import { CATEGORIES } from "./appaware-state";

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
 * An app's logo at 16px, fetched by domain at runtime. Anything without a
 * known domain — or whose icon fails to load — falls back to a gray square, so
 * a missing logo never leaves a ragged gap or borrows the wrong brand.
 */
function AppLogo({ app }: { app: string }) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl(app);
  const box = { width: 16, height: 16, borderRadius: "3px", flexShrink: 0 };

  if (!src || failed) {
    return <Box sx={{ ...box, bgcolor: "action.disabledBackground" }} />;
  }
  return (
    <Box
      component="img"
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      sx={{ ...box, objectFit: "contain" }}
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

export function AppAwareControls({
  state,
  onChange,
}: {
  state: AppAwareState;
  /** Takes an updater, so two edits in one handler don't clobber each other. */
  onChange: Dispatch<SetStateAction<AppAwareState>>;
}) {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [railQuery, setRailQuery] = useState("");
  const [appQuery, setAppQuery] = useState("");
  const { cardRef, height: cardHeight } = useContentHeight();
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const { policies, autoBlock, rules } = state;

  // Updater-shaped setters, so the call sites below read as they did when this
  // state was local. Each resolves against the latest state rather than the
  // render's copy, so calling two of them in one handler is safe.
  const setPolicies = (fn: (prev: Record<string, Policy>) => typeof policies) =>
    onChange((prev) => ({ ...prev, policies: fn(prev.policies) }));
  const setAutoBlock = (
    fn: (prev: Record<string, boolean>) => typeof autoBlock,
  ) => onChange((prev) => ({ ...prev, autoBlock: fn(prev.autoBlock) }));
  const setRules = (fn: (prev: Record<string, Policy>) => typeof rules) =>
    onChange((prev) => ({ ...prev, rules: fn(prev.rules) }));

  // All Apps has no category policy of its own — it's a flat view of the
  // catalog, so the per-category controls sit this one out.
  const showingAll = selectedCat === ALL;
  const category =
    CATEGORIES.find((c) => c.id === selectedCat) ?? CATEGORIES[0];
  const policy = policies[category.id];
  // All Apps reads the same line as a category, just totalled across them.
  const summary = showingAll
    ? CATEGORIES.reduce(
        (acc, c) => {
          const s = summarize(c, policies[c.id], rules);
          return {
            state: acc.state,
            allowExceptions: acc.allowExceptions + s.allowExceptions,
            appBlocks: acc.appBlocks + s.appBlocks,
            blocked: acc.blocked + s.blocked,
            total: acc.total + s.total,
          };
        },
        {
          state: "allow" as State,
          allowExceptions: 0,
          appBlocks: 0,
          blocked: 0,
          total: 0,
        },
      )
    : summarize(category, policy, rules);

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

  // Every category in scope is already blocked? Then the button offers the
  // way back out.
  const allBlocked = showingAll
    ? CATEGORIES.every((c) => policies[c.id] === "block")
    : policy === "block";

  // Setting a policy is a fresh start: the app rules underneath it go. The
  // scope is the selected category, or all of them under All Apps.
  const setScopePolicy = (value: Policy) => {
    const scope = showingAll ? CATEGORIES : [category];
    setRules((prev) => {
      const next = { ...prev };
      for (const c of scope) for (const app of c.apps) delete next[app];
      return next;
    });
    setPolicies((prev) => ({
      ...prev,
      ...Object.fromEntries(scope.map((c) => [c.id, value])),
    }));
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
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            height: "100%",
          }}
        >
          <AppLogo app={params.value as string} />
          <Typography noWrap variant="body2">
            {params.value as string}
          </Typography>
        </Box>
      ),
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
        <Box sx={{ px: 2, pt: 2 }}>
          <Typography variant="cardTitle">Categories</Typography>
        </Box>

        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
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
            <Typography noWrap variant="body1" sx={{ fontWeight: 600 }}>
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
                        sx={{ fontWeight: 600 }}
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
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {`${summary.blocked.toLocaleString()} / ${summary.total.toLocaleString()} blocked`}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ ml: "auto" }}
              onClick={() => setScopePolicy(allBlocked ? "allow" : "block")}
            >
              {allBlocked ? "Unblock all" : "Block all"}
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Switch
              size="small"
              // Across All Apps the switch reads as on only once every
              // category has it, and sets them all in one go.
              checked={
                showingAll
                  ? CATEGORIES.every((c) => autoBlock[c.id])
                  : Boolean(autoBlock[category.id])
              }
              onChange={(e) =>
                setAutoBlock((prev) =>
                  showingAll
                    ? Object.fromEntries(
                        CATEGORIES.map((c) => [c.id, e.target.checked]),
                      )
                    : { ...prev, [category.id]: e.target.checked },
                )
              }
            />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Block new apps as they&apos;re added
              {showingAll ? "" : " to this category"}
            </Typography>
          </Box>
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
          pageSizeOptions={[10, 25, 50, 100]}
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
                      variant="text"
                      color="primary"
                      startIcon={<MaterialSymbol name="check" size={20} />}
                      onClick={() => bulk("allow")}
                    >
                      Unblock
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      startIcon={<MaterialSymbol name="block" size={20} />}
                      onClick={() => bulk("block")}
                    >
                      Block
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
