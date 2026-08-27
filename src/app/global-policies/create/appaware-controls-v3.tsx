// AppAware controls, v3 — same global finder as v2, but the whole tab lives in
// one card: title, search, category rail and app grid are sections of a single
// surface, divided by rules instead of split across three cards.
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
  InputAdornment,
  Divider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import type { Dispatch, SetStateAction } from "react";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

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
import { useGridCardHeight } from "./use-grid-card-height";
import { SearchShortcutHint } from "./search-shortcut-hint";
import { useSearchShortcut } from "./use-search-shortcut";
import {
  OVERFLOW_SHADOW_BOTTOM,
  OVERFLOW_SHADOW_TOP,
  useOverflowShadows,
} from "./use-overflow-shadows";

/** How many live search results to list before summarising the remainder. */
const RESULT_LIMIT = 8;

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

/**
 * Empty state inside a category. The rows are scoped to that category, so the
 * useful next step is widening the search rather than adjusting filters.
 */
function CategoryNoResults() {
  return <NoResultsOverlay description="Try searching in all apps instead." />;
}

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

export function AppAwareControlsV3({
  state,
  onChange,
}: {
  state: AppAwareState;
  /** Takes an updater, so two edits in one handler don't clobber each other. */
  onChange: Dispatch<SetStateAction<AppAwareState>>;
}) {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [appQuery, setAppQuery] = useState("");
  // ⌘K / Ctrl+K jumps to the search field.
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(searchInputRef);
  // Edge shadows on the category list when it has more to scroll to.
  const {
    scrollRef,
    top: overflowTop,
    bottom: overflowBottom,
  } = useOverflowShadows<HTMLDivElement>();
  // Live results for the search card. Matches run across the whole catalog,
  // not just the selected pane, so the field works as a finder.
  const [showResults, setShowResults] = useState(false);
  // Which result the arrow keys are on; -1 is the field itself.
  const [activeResult, setActiveResult] = useState(-1);
  const activeResultRef = useRef<HTMLDivElement | null>(null);
  // Picking a result clears the search field, so the app it narrowed the grid
  // to has to be held separately from the search text.
  const [pickedApp, setPickedApp] = useState<string | null>(null);
  // The rail scrolls, so bring the selected tile into view — otherwise
  // picking a result changes a category you can't see.
  const activeTileRef = useRef<HTMLDivElement | null>(null);
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

  // The header count is catalog-wide, so it doesn't follow the rail selection.
  const catalogBlocked = CATEGORIES.reduce(
    (n, c) => n + summarize(c, policies[c.id], rules).blocked,
    0,
  );

  const scopedApps = showingAll
    ? CATEGORIES.flatMap((c) => c.apps)
    : category.apps;
  // The search field is a finder, not a grid filter: its matches show in the
  // results box, and only picking one narrows the grid. Filtering the grid by
  // the query as well would empty it the moment you typed something the
  // selected category doesn't contain.
  const visibleApps = pickedApp
    ? scopedApps.filter((a) => a === pickedApp)
    : scopedApps;
  const clearSelection = () =>
    setRowSelection({ type: "include", ids: new Set() });

  const trimmed = appQuery.trim().toLowerCase();
  const allMatches = trimmed
    ? CATEGORIES.flatMap((c) =>
        c.apps
          .filter((a) => a.toLowerCase().includes(trimmed))
          .map((a) => ({ app: a, category: c })),
      )
    : [];
  const matches = allMatches.slice(0, RESULT_LIMIT);

  useEffect(() => {
    activeTileRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedCat]);

  useEffect(() => {
    activeResultRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeResult]);

  /** Jump to the app's category and narrow the grid to just that app. */
  const pickResult = (app: string, categoryId: string) => {
    setSelectedCat(categoryId);
    setPickedApp(app);
    // The field resets; the pick lives on in `pickedApp`.
    setAppQuery("");
    setShowResults(false);
    setActiveResult(-1);
    clearSelection();
  };

  /** Arrow keys walk the results; Enter picks; Escape dismisses them. */
  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setShowResults(false);
      setActiveResult(-1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (trimmed === "" || matches.length === 0) return;
      event.preventDefault();
      // A first ArrowDown re-opens results dismissed with Escape.
      setShowResults(true);
      setActiveResult((i) =>
        event.key === "ArrowDown"
          ? Math.min(i + 1, matches.length - 1)
          : Math.max(i - 1, -1),
      );
      return;
    }
    if (event.key === "Enter" && activeResult >= 0) {
      const hit = matches[activeResult];
      if (hit) {
        event.preventDefault();
        pickResult(hit.app, hit.category.id);
      }
    }
  };

  /** Back to the whole category. */
  const clearPick = () => setPickedApp(null);

  /** The policy an app falls under, whichever category owns it. */
  const policyOf = (app: string) => policies[CATEGORY_OF[app].id];

  // One row per app, keyed by name — that's what the rules map is keyed on too.
  const rows = visibleApps.map((app) => ({
    id: app,
    application: app,
    category: CATEGORY_OF[app].name,
    // The Actions column sorts on this: its own rule if it has one, otherwise
    // whatever its category says.
    state: rules[app] ?? policyOf(app),
  }));

  // Sizes the grid card to its rows, capped at the space on offer.
  const { cardRef, height: cardHeight } = useGridCardHeight(rows.length);

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
      width: 200,
      // Sorts allowed before blocked; the field itself isn't on the row, so
      // the value comes from the state computed above.
      valueGetter: (_value, row: { state: Policy }) => row.state,
      filterable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const app = params.id as string;
        // Reads the app's effective state: its own rule if it has one,
        // otherwise whatever its category says.
        const effective: Policy = rules[app] ?? policyOf(app);
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={effective}
              // Same sizing as the schedule drawer's day-of-week picker.
              sx={{
                "& .MuiToggleButton-root": {
                  minWidth: 44,
                  py: "4px",
                  px: "12px",
                  textTransform: "uppercase",
                },
              }}
              onChange={(_event, next: Policy | null) => {
                // A group with `exclusive` fires null when you click the
                // already-selected side; there's nothing to change then.
                if (!next) return;
                // Landing back on the category's own policy drops the app
                // rule rather than pinning a redundant one.
                setRule([app], next === policyOf(app) ? null : next);
              }}
            >
              <ToggleButton value="allow">Allow</ToggleButton>
              <ToggleButton value="block">Block</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        );
      },
    },
  ];

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Search and the catalog-wide count, on the same three columns as the
          panes below so they line up, ruled off from the panes. */}
      <Box
        sx={{
          flexShrink: 0,
          py: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search all apps..."
          inputRef={searchInputRef}
          onKeyDown={onSearchKeyDown}
          value={appQuery}
          onChange={(e) => {
            // Typing only drives the results box. The panes below change on a
            // pick, never on a keystroke.
            setAppQuery(e.target.value);
            setShowResults(true);
            setActiveResult(-1);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <SearchShortcutHint />
                </InputAdornment>
              ),
            },
          }}
          sx={{ px: 2 }}
        />

        {/* Spacer — the count sits over the grid pane, not beside the field. */}
        <Box />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            // Matches the grid pane's right inset below, so the count lines up
            // with the card edge rather than touching the card's border.
            pr: 2,
          }}
        >
          <Typography variant="body1" sx={{ color: "text.primary" }}>
            {catalogBlocked.toLocaleString()} / {TOTAL_APPS.toLocaleString()}{" "}
            blocked
          </Typography>
        </Box>

        {/* Results sit in the card under the field rather than floating over
            the panes, so they push the layout instead of covering it. */}
        {showResults && trimmed !== "" && (
          <Box
            sx={{
              gridColumn: "1 / -1",
              mt: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              maxHeight: 260,
              overflow: "auto",
            }}
          >
            {matches.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ p: 2, color: "text.secondary" }}
              >
                No applications match &quot;{appQuery}&quot;
              </Typography>
            ) : (
              <>
                {matches.map(({ app, category: c }, i) => (
                  <Box
                    key={`${c.id}-${app}`}
                    ref={i === activeResult ? activeResultRef : undefined}
                    onMouseEnter={() => setActiveResult(i)}
                    onClick={() => pickResult(app, c.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      px: 2,
                      py: 1,
                      cursor: "pointer",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-of-type": { borderBottom: "none" },
                      bgcolor:
                        i === activeResult ? "action.hover" : "transparent",
                    }}
                  >
                    <AppLogo app={app} />
                    <Typography noWrap variant="body2" sx={{ flex: 1 }}>
                      {app}
                    </Typography>
                    {/* Same category chip the unblock-request drawers use. */}
                    <Chip
                      label={c.name}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>
                ))}
                {/* Never silently truncate — say what was left out. */}
                {allMatches.length > matches.length && (
                  <Typography
                    variant="body2"
                    sx={{ px: 2, py: 1, color: "text.secondary" }}
                  >
                    {(allMatches.length - matches.length).toLocaleString()} more
                    match{allMatches.length - matches.length > 1 ? "es" : ""} —
                    keep typing to narrow
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          // The row is pinned to the container's height so the cards have
          // something definite to size against.
          gridTemplateRows: "minmax(0, 1fr)",
          gap: 2,
          pt: 2,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* CATEGORY RAIL — each category's policy and how many apps override it. */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="cardTitle">Categories</Typography>
          </Box>

          {/* The list sits in a rounded panel, inset from the card edge —
              the same treatment as the grid's well. */}
          <Box sx={{ flex: 1, minHeight: 0, pl: 2, pb: 2, display: "flex" }}>
            {/* Relative to the scroll box alone, so the edge shadows sit on
                its edges rather than the padded wrapper's. */}
            <Box
              sx={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                display: "flex",
              }}
            >
              <Box
                ref={scrollRef}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  overflow: "auto",
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
                    clearPick();
                  }}
                  sx={tileSx(showingAll)}
                >
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Typography noWrap variant="body1" sx={{ fontWeight: 600 }}>
                      All Apps
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ flexShrink: 0, color: "text.secondary" }}
                    >
                      ({TOTAL_APPS.toLocaleString()})
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {CATEGORIES.map((c) => {
                    const active = !showingAll && c.id === category.id;
                    const sum = summarize(c, policies[c.id], rules);
                    return (
                      <Box
                        key={c.id}
                        ref={active ? activeTileRef : undefined}
                        onClick={() => {
                          setSelectedCat(c.id);
                          clearSelection();
                          setAppQuery("");
                          clearPick();
                        }}
                        sx={tileSx(active)}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
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
                          <Typography
                            variant="body2"
                            sx={{ flexShrink: 0, color: "text.secondary" }}
                          >
                            ({c.apps.length.toLocaleString()})
                          </Typography>
                        </Box>
                        <StateChip state={sum.state} />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              {/* One overlay carrying whichever edges have more to scroll to,
                  using the same shadow the grid puts on its pinned columns. */}
              {(overflowTop || overflowBottom) && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    boxShadow: [
                      overflowTop && OVERFLOW_SHADOW_TOP,
                      overflowBottom && OVERFLOW_SHADOW_BOTTOM,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* DETAIL PANE */}
        {/* The grid is a card on a tinted well, inset from the outer card's
            edge so the well reads as its own rounded panel. */}
        <Box
          sx={{
            gridColumn: { md: "span 2" },
            minWidth: 0,
            minHeight: 0,
            pr: 2,
            pb: 2,
            display: "flex",
          }}
        >
          <Box
            sx={(theme) => ({
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              p: 2,
              display: "flex",
              borderRadius: 1,
              bgcolor: "var(--dnsf-palette-background-neutral)",
              ...theme.applyStyles("dark", {
                bgcolor: "var(--dnsf-palette-background-default)",
              }),
            })}
          >
            <Card
              ref={cardRef}
              sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                // Measured: hugs the rows, capped at the space on offer.
                height: cardHeight ?? "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
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
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
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
                    variant="contained"
                    color="secondary"
                    sx={{ ml: "auto" }}
                    onClick={() =>
                      setScopePolicy(allBlocked ? "allow" : "block")
                    }
                  >
                    {allBlocked ? "Unblock all" : "Block all"}
                  </Button>
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
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
                density="standard"
                initialPageSize={25}
                pageSizeOptions={[10, 25, 50, 100]}
                showFilters={false}
                showDefaultView={false}
                showPreferences={false}
                showExport={false}
                showRefresh={false}
                showSearch={false}
                noRowsOverlay={
                  showingAll ? NoResultsOverlay : CategoryNoResults
                }
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
                            onClick={() => bulk("allow")}
                          >
                            Allow
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            color="error"
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
        </Box>
      </Box>
    </Card>
  );
}
