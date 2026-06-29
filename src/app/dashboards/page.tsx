// Custom Dashboard — direct-manipulation widget grid (6 columns).
//
// Widgets are draggable to reorder, resizable by their corner gripper, and
// removable from the per-card hover toolbar. The header has a dashboard
// switcher, Actions menu (Rename / Delete), Share, and Add content. The
// layout persists in localStorage.

import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { Modal } from "@/components/modal";

import { AddPanel } from "./add-panel";
import {
  DEFAULT_FILTERS,
  DashboardFactorContext,
  TIME_RANGE_OPTIONS,
  filterFactor,
  type DashboardFilters,
} from "./dashboard-filters";
import { AdvancedFilters } from "./advanced-filters";
import { QuickFilters } from "./quick-filters";
import { DashCard } from "./dash-card";
import { DashSwitcher } from "./dash-switcher";
import { CATALOG_BY_TYPE, type WidgetInstance } from "./lib";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const COLS = 6;
const LS_KEY = "dnsf_custom_dash_v4";

const clampSpan = (s: number) => Math.min(COLS, Math.max(1, Number(s) || 1));

// Simulate the grid's row-flow packing so each widget gets an explicit
// (row, column) and we can find the empty cells the user can resize/drag into.
function packLayout(widgets: WidgetInstance[]) {
  const placements: Record<string, { row: number; col: number }> = {};
  let row = 0;
  let col = 0;
  for (const w of widgets) {
    const span = clampSpan(w.span);
    if (col + span > COLS) {
      row++;
      col = 0;
    }
    placements[w.id] = { row, col };
    col += span;
  }
  const rows = widgets.length
    ? Math.max(...widgets.map((w) => placements[w.id].row)) + 1
    : 0;
  const occupied = new Set<string>();
  for (const w of widgets) {
    const { row: r, col: c } = placements[w.id];
    for (let i = c; i < c + clampSpan(w.span); i++) occupied.add(`${r}:${i}`);
  }
  const emptyCells: { row: number; col: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!occupied.has(`${r}:${c}`)) emptyCells.push({ row: r, col: c });
    }
  }
  return { placements, emptyCells };
}

let _uid = 100;
const uid = () => "w" + ++_uid;
const bumpUid = (ws: WidgetInstance[]) => {
  ws.forEach((w) => {
    const n = parseInt(String(w.id).replace(/\D/g, ""), 10);
    if (n > _uid) _uid = n;
  });
};

const DEFAULT_LAYOUT = (): WidgetInstance[] => [
  { id: uid(), type: "kpi-total", span: 1 },
  { id: uid(), type: "kpi-allowed", span: 1 },
  { id: uid(), type: "kpi-blocked", span: 1 },
  { id: uid(), type: "kpi-threats", span: 1 },
  { id: uid(), type: "status-sites", span: 1 },
  { id: uid(), type: "status-roaming", span: 1 },
  { id: uid(), type: "status-users", span: 1 },
  { id: uid(), type: "status-relays", span: 1 },
  { id: uid(), type: "request-activity", span: 4 },
  { id: uid(), type: "cat-breakdown", span: 2 },
  { id: uid(), type: "top-domains", span: 2 },
  { id: uid(), type: "top-orgs", span: 2 },
];

// Keep only widgets whose type still exists in the catalog. De-duplicate IDs.
function sanitize(arr: unknown): WidgetInstance[] | null {
  if (!Array.isArray(arr)) return null;
  const seen = new Set<string>();
  return arr
    .filter(
      (w): w is { id?: string; type?: string; span?: number } =>
        Boolean(w) &&
        typeof w === "object" &&
        typeof (w as { type?: unknown }).type === "string" &&
        Boolean(CATALOG_BY_TYPE[(w as { type: string }).type]),
    )
    .map((w) => {
      let id = w.id;
      while (!id || seen.has(id)) id = uid();
      seen.add(id);
      return {
        id,
        type: w.type as string,
        span: clampSpan(w.span ?? 1),
      };
    });
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 2,
        py: 3,
        textAlign: "center",
      }}
    >
      <Box component="img" src="/dashboard.svg" alt="" sx={{ width: 80, height: 80 }} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          px: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: (t) => t.typography.fontSecondaryFamily,
              fontWeight: 600,
              fontSize: 18,
              lineHeight: 1.33,
              color: "text.primary",
            }}
          >
            Build your dashboard
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.34,
              color: "text.primary",
              maxWidth: 360,
              textAlign: "center",
            }}
          >
            This dashboard is empty. Add KPI counters, charts, maps, and tables
            to track exactly what matters to you.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={onAdd}
          startIcon={
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add
            </span>
          }
        >
          Add your first widget
        </Button>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

// Read the persisted layout once at module load so React's initial state can
// be primed without a setState-in-effect.
function readPersisted(): { name?: string; widgets?: WidgetInstance[] } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      name?: unknown;
      widgets?: unknown;
    };
    const widgets = sanitize(parsed.widgets) ?? undefined;
    if (widgets) bumpUid(widgets);
    return {
      name: typeof parsed.name === "string" ? parsed.name : undefined,
      widgets: widgets && widgets.length > 0 ? widgets : undefined,
    };
  } catch {
    return {};
  }
}

export default function DashboardsPage() {
  const navigate = useNavigate();
  const persisted = readPersisted();
  const [name, setName] = useState(persisted.name ?? "FilterDNS Overview");
  const [widgets, setWidgets] = useState<WidgetInstance[]>(
    () => persisted.widgets ?? DEFAULT_LAYOUT(),
  );

  const [addOpen, setAddOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<WidgetInstance | null>(
    null,
  );
  const [actionsAnchor, setActionsAnchor] = useState<HTMLElement | null>(null);
  const [dashDeleteOpen, setDashDeleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [switcherAnchor, setSwitcherAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  // Autosave indicator: any layout/filter change shows a spinner ("Autosaving")
  // for 1.5s, then a check ("Autosaved"), simulating a real save round-trip.
  const [autosave, setAutosave] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const triggerAutosave = useCallback(() => {
    setAutosave("saving");
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => setAutosave("saved"), 1500);
  }, []);
  useEffect(() => () => clearTimeout(autosaveTimer.current), []);

  // Active (non-default) filters as removable chips.
  const filterChips: { label: string; onDelete: () => void }[] = [];
  if (filters.timeRange !== DEFAULT_FILTERS.timeRange) {
    filterChips.push({
      label:
        TIME_RANGE_OPTIONS.find((o) => o.value === filters.timeRange)?.label ??
        filters.timeRange,
      onDelete: () =>
        setFilters((f) => ({ ...f, timeRange: DEFAULT_FILTERS.timeRange })),
    });
  }
  (["results", "sites", "deploymentTypes", "categories"] as const).forEach(
    (key) =>
      filters[key].forEach((value) =>
        filterChips.push({
          label: value,
          onDelete: () =>
            setFilters((f) => ({
              ...f,
              [key]: f[key].filter((v) => v !== value),
            })),
        }),
      ),
  );

  // Persist name + widgets.
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ name, widgets }));
    } catch {
      /* noop */
    }
  }, [name, widgets]);

  const addWidget = (type: string) => {
    const def = CATALOG_BY_TYPE[type];
    if (!def) return;
    setWidgets((ws) => [
      ...ws,
      { id: uid(), type, span: clampSpan(def.span) },
    ]);
    triggerAutosave();
  };
  const removeWidget = (id: string) =>
    setWidgets((ws) => ws.filter((w) => w.id !== id));
  const setSpan = (id: string, span: number) => {
    setWidgets((ws) =>
      ws.map((w) => (w.id === id ? { ...w, span: clampSpan(span) } : w)),
    );
    triggerAutosave();
  };

  const deleteDashboard = () => {
    const others = [
      "Security Summary",
      "MSP Client Health",
      "Events – 2025",
      "FilterDNS Overview",
    ].filter((n) => n !== name);
    setName(others[0] || "New Dashboard");
    setWidgets(DEFAULT_LAYOUT());
    setDashDeleteOpen(false);
  };

  // Pointer-based live reorder (5px movement threshold so a plain click
  // inside a widget never triggers an accidental reorder).
  const beginDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      if (e.button > 0) return;
      const startX = e.clientX;
      const startY = e.clientY;
      let started = false;
      const reorder = (ev: PointerEvent) => {
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const cardEl = el?.closest("[data-widget-id]");
        if (!cardEl) return;
        const overId = cardEl.getAttribute("data-widget-id");
        if (!overId || overId === id) return;
        setWidgets((ws) => {
          const from = ws.findIndex((w) => w.id === id);
          const to = ws.findIndex((w) => w.id === overId);
          if (from < 0 || to < 0 || from === to) return ws;
          const next = ws.slice();
          const [m] = next.splice(from, 1);
          next.splice(to, 0, m);
          return next;
        });
      };
      const move = (ev: PointerEvent) => {
        if (!started) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
          started = true;
          setDragId(id);
          document.body.style.userSelect = "none";
          document.body.style.cursor = "grabbing";
        }
        reorder(ev);
      };
      const up = () => {
        if (started) {
          setDragId(null);
          document.body.style.userSelect = "";
          document.body.style.cursor = "";
          triggerAutosave();
        }
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [triggerAutosave],
  );

  // Packed layout (explicit row/col per widget + the empty cells in between).
  const layout = packLayout(widgets);

  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "background.default",
        overflow: "auto",
        position: "relative",
        height: "100%",
      }}
    >
      {/* Dashboard header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 4,
          bgcolor: "background.paper",
          boxShadow: 1,
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton
          size="small"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
          onClick={() => {
            setFavorited((prev) => !prev);
            setToast(favorited ? "Removed from favorites" : "Added to favorites");
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 20,
              color: favorited
                ? "var(--dnsf-palette-warning-main)"
                : "var(--dnsf-palette-text-disabled)",
              fontVariationSettings: favorited ? '"FILL" 1' : '"FILL" 0',
            }}
          >
            star
          </span>
        </IconButton>

        {renaming ? (
          <ClickAwayListener onClickAway={() => setRenaming(false)}>
            <TextField
              autoFocus
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setRenaming(false)}
              sx={(theme) => ({
                "& .MuiOutlinedInput-input": {
                  ...theme.typography.pageTitle,
                  py: 0.5,
                  px: 1,
                },
              })}
            />
          </ClickAwayListener>
        ) : (
          <Box
            role="button"
            onClick={(e) =>
              setSwitcherAnchor((cur) =>
                cur ? null : (e.currentTarget as HTMLElement),
              )
            }
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Typography variant="pageTitle" sx={{ color: "text.primary" }}>
              {name}
            </Typography>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 18,
                color: "var(--dnsf-palette-text-disabled)",
              }}
            >
              {switcherAnchor ? "expand_less" : "expand_more"}
            </span>
          </Box>
        )}
        <DashSwitcher
          anchorEl={switcherAnchor}
          open={Boolean(switcherAnchor)}
          current={name}
          onPick={(n) => {
            setName(n);
            setSwitcherAnchor(null);
          }}
          onCreate={() => {
            setSwitcherAnchor(null);
            setName("New Dashboard");
            setWidgets([]);
          }}
          onManage={() => {
            setSwitcherAnchor(null);
            navigate("/dashboards/manage");
          }}
          onClose={() => setSwitcherAnchor(null)}
        />

        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={(e) => setActionsAnchor(e.currentTarget)}
          endIcon={<ArrowDropDownOutlinedIcon sx={{ opacity: 0.6 }} />}
        >
          Actions
        </Button>
        <Menu
          anchorEl={actionsAnchor}
          open={Boolean(actionsAnchor)}
          onClose={() => setActionsAnchor(null)}
          // Don't return focus to the anchor on close, so Rename's autoFocused
          // text field keeps the cursor.
          disableRestoreFocus
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {/* Edit-this-dashboard cluster */}
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setRenaming(true);
              setSwitcherAnchor(null);
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, marginRight: 8, opacity: 0.7 }}
            >
              edit
            </span>
            Rename
          </MenuItem>
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setToast(`${name} duplicated`);
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, marginRight: 8, opacity: 0.7 }}
            >
              content_copy
            </span>
            Duplicate
          </MenuItem>

          <Divider />

          {/* Defaults cluster */}
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setToast(`${name} set as default`);
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, marginRight: 8, opacity: 0.7 }}
            >
              check_circle
            </span>
            Set as default
          </MenuItem>
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setToast(`${name} set as org default`);
            }}
          >
            <AssignmentTurnedInOutlinedIcon
              sx={{ fontSize: 16, mr: 1, opacity: 0.7 }}
            />
            Set as org default
          </MenuItem>

          <Divider />

          {/* Share band */}
          <MenuItem onClick={() => setActionsAnchor(null)}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, marginRight: 8, opacity: 0.7 }}
            >
              share
            </span>
            Share
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setResetOpen(true);
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, marginRight: 8, opacity: 0.7 }}
            >
              restart_alt
            </span>
            Reset to app default
          </MenuItem>

          <Divider />

          {/* Destructive */}
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              setDashDeleteOpen(true);
            }}
            sx={{ color: "error.main" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, marginRight: 8 }}
            >
              delete
            </span>
            Delete
          </MenuItem>
        </Menu>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddOpen(true)}
          startIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              add
            </span>
          }
        >
          Add content
        </Button>
      </Box>

      {/* Filter strip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          pt: 1.5,
          mb: filterChips.length > 0 ? 1 : 2,
          fontSize: 14,
        }}
      >
        <Button
          variant="text"
          color="secondary"
          size="small"
          onClick={() => setQuickFiltersOpen(true)}
          startIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              filter_alt
            </span>
          }
        >
          Quick filters
        </Button>
        <Box sx={{ width: "1px", height: 16, bgcolor: "divider" }} />
        <Button
          variant="text"
          color="secondary"
          size="small"
          onClick={() => setAdvancedFiltersOpen(true)}
          startIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              tune
            </span>
          }
        >
          Advanced filters
        </Button>
        <Box sx={{ flex: 1 }} />
        {autosave !== "idle" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.secondary",
              mr: 0.5,
            }}
          >
            {autosave === "saving" ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                check
              </span>
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {autosave === "saving" ? "Autosaving" : "Autosaved"}
            </Typography>
          </Box>
        )}
        <Button
          variant="text"
          color="secondary"
          size="small"
          startIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              refresh
            </span>
          }
        >
          Refresh
        </Button>
      </Box>

      {/* Active filters */}
      {filterChips.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            px: 2,
            mb: 2,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Active Filters:
          </Typography>
          {filterChips.map((chip) => (
            <Chip
              key={chip.label}
              size="small"
              label={chip.label}
              onDelete={chip.onDelete}
            />
          ))}
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={() => {
              setFilters(DEFAULT_FILTERS);
              triggerAutosave();
            }}
            startIcon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                delete
              </span>
            }
          >
            Clear
          </Button>
        </Box>
      )}

      {/* Widget grid / empty state */}
      {widgets.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <DashboardFactorContext.Provider value={filterFactor(filters)}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gap: 2,
              px: 2,
              pb: 10,
              alignItems: "stretch",
            }}
          >
            {/* Empty-cell guides — revealed while dragging/resizing so the user
                sees exactly which open cells the widget can occupy. Placed as
                real grid items so each one matches its row's height. */}
            {(resizing || dragId !== null) &&
              layout.emptyCells.map((cell) => (
                <Box
                  key={`${cell.row}:${cell.col}`}
                  aria-hidden
                  sx={{
                    gridColumn: cell.col + 1,
                    gridRow: cell.row + 1,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  }}
                />
              ))}
            {widgets.map((w) => (
              <DashCard
                key={w.id}
                widget={w}
                pad={2}
                cols={COLS}
                colStart={layout.placements[w.id].col}
                rowIndex={layout.placements[w.id].row}
                dragging={dragId === w.id}
                onRemove={() => setPendingDelete(w)}
                onSpan={(s) => setSpan(w.id, s)}
                onBeginDrag={beginDrag}
                onResizingChange={setResizing}
              />
            ))}
          </Box>
        </DashboardFactorContext.Provider>
      )}

      {/* Slide-out add content panel */}
      <AddPanel
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onApply={(types) => {
          types.forEach((t) => addWidget(t));
          setToast(
            `${types.length} widget${types.length === 1 ? "" : "s"} added`,
          );
        }}
      />

      <QuickFilters
        open={quickFiltersOpen}
        onClose={() => setQuickFiltersOpen(false)}
        filters={filters}
        onApply={(next) => {
          setFilters(next);
          triggerAutosave();
        }}
      />

      <AdvancedFilters
        open={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
      />

      {/* Widget delete confirmation */}
      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Remove widget?"
        width={420}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setPendingDelete(null),
        }}
        primaryAction={{
          label: "Remove",
          color: "error",
          sx: { color: "common.white" },
          onClick: () => {
            if (pendingDelete) {
              removeWidget(pendingDelete.id);
              const name = CATALOG_BY_TYPE[pendingDelete.type]?.name ?? "Widget";
              setToast(`${name} removed`);
            }
            setPendingDelete(null);
          },
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          <Box component="b" sx={{ color: "text.primary" }}>
            {(pendingDelete && CATALOG_BY_TYPE[pendingDelete.type]?.name) || ""}
          </Box>{" "}
          will be removed from this dashboard. You can add it back anytime by
          clicking the{" "}
          <Box component="b" sx={{ color: "text.primary" }}>
            ADD CONTENT
          </Box>{" "}
          button.
        </Typography>
      </Modal>

      {/* Dashboard delete confirmation */}
      <Modal
        open={dashDeleteOpen}
        onClose={() => setDashDeleteOpen(false)}
        title="Delete dashboard?"
        width={420}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setDashDeleteOpen(false),
        }}
        primaryAction={{
          label: "Delete dashboard",
          color: "error",
          sx: { color: "common.white" },
          onClick: deleteDashboard,
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          <Box component="b" sx={{ color: "text.primary" }}>
            {name}
          </Box>{" "}
          and all of its widgets will be permanently deleted. This can&apos;t be
          undone.
        </Typography>
      </Modal>

      {/* Reset-to-default confirmation */}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset to app default?"
        width={420}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setResetOpen(false),
        }}
        primaryAction={{
          label: "Reset to app default",
          onClick: () => {
            setWidgets(DEFAULT_LAYOUT());
            triggerAutosave();
            setResetOpen(false);
          },
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          <Box component="b" sx={{ color: "text.primary" }}>
            {name}
          </Box>{" "}
          will be restored to the default layout. Your current widget selection
          and arrangement on this dashboard will be replaced. This can&apos;t be
          undone.
        </Typography>
      </Modal>

      {/* Add/remove toast */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="standard"
          elevation={8}
          onClose={() => setToast(null)}
          sx={{
            alignItems: "center",
            "& .MuiAlert-icon": { alignSelf: "center", py: 0 },
            "& .MuiAlert-message": { py: 0 },
            "& .MuiAlert-action": { alignSelf: "center", py: 0, pt: 0 },
          }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
