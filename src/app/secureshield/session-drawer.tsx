// AgentShield → one session, opened from a log row.
//
// What the session was, the request the reader arrived from, the processes it
// ran, and — because attribution is the question this page always raises —
// why every one of them reports as the application rather than as itself.

import {
  Alert,
  AlertTitle,
  Box,
  Card,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";

import { DataTable } from "@/components/data-table";
import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

import type { LogRow } from "./logs-data";
import { sessionFor } from "./session-data";

/** A label over its value, the way the application page states its facts. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ display: "block", lineHeight: 1.4, color: "text.secondary" }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: "2px", fontWeight: 600, color: "text.primary" }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/** The heading over each block of the drawer. */
function Section({ children }: { children: string }) {
  return (
    <Typography
      variant="body2"
      sx={{ display: "block", fontWeight: 600, color: "text.primary" }}
    >
      {children}
    </Typography>
  );
}

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/** The request that led here, in the Logs table's own columns. */
const SOURCE_COLUMNS: GridColDef[] = [
  {
    field: "fqdn",
    headerName: "FQDN",
    flex: 1,
    minWidth: 220,
    renderCell: (params) => (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        {params.value as string}
      </Box>
    ),
  },
  {
    field: "time",
    headerName: "Time",
    width: 210,
    valueFormatter: (value: string) => stamp(value),
  },
  {
    field: "category",
    headerName: "Category",
    width: 200,
    // Neutral, like any other label on a row — the dot carries the category.
    renderCell: (params) => {
      const category = params.value as string;
      return (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          <Chip
            size="small"
            label={category}
            sx={(theme: Theme) => ({
              borderRadius: "6px",
              bgcolor: theme.vars.palette.action.selected,
              color: theme.vars.palette.text.primary,
            })}
          />
        </Box>
      );
    },
  },
  {
    field: "result",
    headerName: "Result",
    width: 140,
    renderCell: (params) => {
      const allowed = params.value === "Allowed";
      return (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          <Chip
            size="small"
            icon={
              <MaterialSymbol name={allowed ? "check" : "block"} size={16} />
            }
            label={params.value as string}
            sx={(theme: Theme) => ({
              borderRadius: "6px",
              bgcolor: allowed
                ? theme.vars.palette.Alert.successStandardBg
                : theme.vars.palette.Alert.errorStandardBg,
              color: allowed
                ? theme.vars.palette.Alert.successColor
                : theme.vars.palette.Alert.errorColor,
              "& .MuiChip-icon, & .MuiChip-label": { color: "inherit" },
            })}
          />
        </Box>
      );
    },
  },
];

export function SessionDrawer({
  open,
  row,
  onClose,
}: {
  open: boolean;
  /** The log row the reader came from; null while the drawer is closed. */
  row: LogRow | null;
  onClose: () => void;
}) {
  const session = row ? sessionFor(row) : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="large"
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {session ? `${session.app} on ${session.client}` : "Session"}
          {/* What the session ran into, beside what it was. */}
          {session?.threats ? (
            <Chip
              size="small"
              label={`${session.threats} threat${session.threats > 1 ? "s" : ""} reached`}
              sx={(theme: Theme) => ({
                borderRadius: "6px",
                fontWeight: 400,
                bgcolor: theme.vars.palette.Alert.errorStandardBg,
                color: theme.vars.palette.Alert.errorColor,
                "& .MuiChip-label": { color: "inherit", fontWeight: 400 },
              })}
            />
          ) : null}
        </Box>
      }
      subheader={
        session
          ? `Session ${session.sessionId} · ${stamp(session.start)} – ${clock(
              session.end,
            )}`
          : undefined
      }
      primaryAction={{ label: "Close", onClick: onClose }}
    >
      {session && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <Fact label="AI Application" value={session.app} />
            <Fact label="Roaming Client" value={session.client} />
            <Fact label="Logged on User" value={session.user} />
            <Fact label="Site" value={session.site} />
            <Fact label="Requests" value={session.requests.toLocaleString()} />
            <Fact
              label="Blocked by policy"
              value={session.blocked.toLocaleString()}
            />
          </Box>

          <Box>
            <Divider sx={{ mb: 2 }} />
            <Section>The request you came from</Section>
            <Card variant="outlined" sx={{ mt: 1 }}>
              {/* One row, as a grid — the same five columns the Logs table
                  shows, for the request that led here. */}
              <DataTable
                rows={[
                  {
                    id: "source",
                    fqdn: session.source.fqdn,
                    time: session.source.time,
                    category: session.source.category,
                    result: session.source.result,
                  },
                ]}
                columns={SOURCE_COLUMNS}
                checkboxSelection={false}
                showSearch={false}
                showFilters={false}
                showDefaultView={false}
                showPreferences={false}
                showExport={false}
                showRefresh={false}
                initialPageSize={5}
                // One row: the pager underneath it is noise.
                sx={{ "& .MuiDataGrid-footerContainer": { display: "none" } }}
              />
            </Card>
          </Box>

          <Box>
            <Section>Process tree for this session</Section>
            <Card variant="outlined" sx={{ mt: 1, overflow: "hidden" }}>
              {/* A table rather than a grid: five columns, no sorting, and the
                  indent is the information. */}
              <Box
                component="table"
                sx={{
                  width: "100%",
                  borderCollapse: "collapse",
                  "& th, & td": {
                    px: 2,
                    py: 1.25,
                    textAlign: "left",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  },
                  "& tr:last-of-type td": { borderBottom: "none" },
                  "& th": {
                    fontWeight: 600,
                    fontSize: 14,
                    color: "text.primary",
                    bgcolor: "background.neutral",
                  },
                  "& td": { fontSize: 14, color: "text.primary" },
                  "& .num": { textAlign: "right", whiteSpace: "nowrap" },
                }}
              >
                <Box component="thead">
                  <Box component="tr">
                    <Box component="th">Process</Box>
                    <Box component="th" className="num">
                      PID
                    </Box>
                    <Box component="th">Signed by</Box>
                    <Box component="th" className="num">
                      Requests
                    </Box>
                    <Box component="th" className="num">
                      Blocked
                    </Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {session.processes.map((process) => (
                    <Box component="tr" key={process.pid}>
                      <Box component="td" sx={{ fontWeight: 600 }}>
                        <Box
                          component="span"
                          sx={{ pl: `${process.depth * 24}px` }}
                        >
                          {process.depth > 0 && (
                            <Box
                              component="span"
                              sx={{ color: "text.disabled", pr: 1 }}
                            >
                              └
                            </Box>
                          )}
                          {process.name}
                        </Box>
                      </Box>
                      <Box component="td" className="num">
                        {process.pid}
                      </Box>
                      <Box component="td" sx={{ color: "text.secondary" }}>
                        {process.signedBy ?? "—"}
                      </Box>
                      <Box component="td" className="num">
                        {process.requests.toLocaleString()}
                      </Box>
                      <Box component="td" className="num">
                        {process.blocked.toLocaleString()}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Attribution is the question this page always raises, so the
              answer reads as a note rather than more body copy. */}
          <Alert severity="info" sx={{ "& .MuiAlertTitle-root": { mb: 0.5 } }}>
            <AlertTitle sx={{ fontSize: 14 }}>
              {`Why this session says ${session.app}`}
            </AlertTitle>
            <Typography variant="body2" sx={{ color: "inherit" }}>
              {session.why}
            </Typography>
          </Alert>
        </Box>
      )}
    </Drawer>
  );
}
