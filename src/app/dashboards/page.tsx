// Custom Dashboard — direct-manipulation widget grid (6 columns).
//
// Widgets are draggable to reorder, resizable by their corner gripper, and
// removable from the per-card hover toolbar. The header has a dashboard
// switcher, Actions menu (Rename / Delete), Share, and Add content. The
// layout persists in localStorage.

import {
  Alert,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { Modal } from "@/components/modal";

import { AddPanel } from "./add-panel";
import {
  DEFAULT_FILTERS,
  DashboardFactorContext,
  TIME_RANGE_OPTIONS,
  filterFactor,
  type DashboardFilters,
} from "./dashboard-filters";
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
        py: 11,
        px: 2,
        gap: 2,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 76,
          height: 76,
          borderRadius: 2,
          bgcolor: "rgba(53,39,253,.08)",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
          dashboard
        </span>
      </Box>
      <Typography
        sx={{
          fontFamily: (t) => t.typography.fontSecondaryFamily,
          fontWeight: 600,
          fontSize: 22,
          color: "text.primary",
        }}
      >
        Build your dashboard
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          color: "text.secondary",
          opacity: 0.8,
          maxWidth: 360,
          lineHeight: 1.5,
        }}
      >
        This dashboard is empty. Add KPI counters, charts, maps, and tables to
        track exactly what matters to you.
      </Typography>
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
  const persisted = readPersisted();
  const [name, setName] = useState(persisted.name ?? "FilterDNS Overview");
  const [widgets, setWidgets] = useState<WidgetInstance[]>(
    () => persisted.widgets ?? DEFAULT_LAYOUT(),
  );

  const [addOpen, setAddOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WidgetInstance | null>(
    null,
  );
  const [actionsAnchor, setActionsAnchor] = useState<HTMLElement | null>(null);
  const [dashDeleteOpen, setDashDeleteOpen] = useState(false);
  const [switcherAnchor, setSwitcherAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

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
  };
  const removeWidget = (id: string) =>
    setWidgets((ws) => ws.filter((w) => w.id !== id));
  const setSpan = (id: string, span: number) =>
    setWidgets((ws) =>
      ws.map((w) => (w.id === id ? { ...w, span: clampSpan(span) } : w)),
    );

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
        }
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [],
  );

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
          borderBottom: "1px solid",
          borderColor: "divider",
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.75,
          height: 60,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 18, color: "var(--dnsf-palette-text-disabled)" }}
        >
          star
        </span>

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
              expand_more
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
          onClose={() => setSwitcherAnchor(null)}
        />

        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={(e) => setActionsAnchor(e.currentTarget)}
          startIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              tune
            </span>
          }
          endIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, opacity: 0.6 }}
            >
              expand_more
            </span>
          }
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
          <MenuItem onClick={() => setActionsAnchor(null)}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, marginRight: 8, opacity: 0.7 }}
            >
              share
            </span>
            Share
          </MenuItem>
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
          gap: 2.25,
          px: 2,
          pt: 1.5,
          mb: 2,
          fontSize: 14,
        }}
      >
        <Box
          role="button"
          onClick={() => setQuickFiltersOpen(true)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            color: "text.secondary",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            add
          </span>
          Quick filters
        </Box>
        <Box sx={{ width: "1px", height: 16, bgcolor: "divider" }} />
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            color: "text.secondary",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            filter_alt
          </span>
          Advanced filters
        </Box>
        {filterChips.length > 0 && (
          <Box sx={{ width: "1px", height: 16, bgcolor: "divider" }} />
        )}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            alignItems: "center",
          }}
        >
          {filterChips.map((chip) => (
            <Chip
              key={chip.label}
              size="small"
              label={chip.label}
              onDelete={chip.onDelete}
            />
          ))}
        </Box>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" color="secondary" aria-label="refresh">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            refresh
          </span>
        </IconButton>
      </Box>

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
            {widgets.map((w) => (
              <DashCard
                key={w.id}
                widget={w}
                pad={2}
                cols={COLS}
                dragging={dragId === w.id}
                onRemove={() => setPendingDelete(w)}
                onSpan={(s) => setSpan(w.id, s)}
                onBeginDrag={beginDrag}
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
        onApply={setFilters}
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
