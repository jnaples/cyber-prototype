// AgentShield → one session, opened from a log row.
//
// What the session was, the request the reader arrived from, the processes it
// ran, and — because attribution is the question this page always raises —
// why every one of them reports as the application rather than as itself.

import { Box, Card, Chip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

import { CATEGORY_COLORS, type LogRow } from "./logs-data";
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
      <Typography sx={{ mt: "2px", fontWeight: 600, color: "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}

/** The small caps heading over each block of the drawer. */
function Section({ children }: { children: string }) {
  return (
    <Typography
      variant="overline"
      sx={{ display: "block", lineHeight: 1.4, color: "text.secondary" }}
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
      title={session ? `${session.app} on ${session.client}` : "Session"}
      subheader={
        session
          ? `Session ${session.sessionId} · ${stamp(session.start)} – ${clock(
              session.end,
            )}`
          : undefined
      }
      actions={
        session?.threats ? (
          <Chip
            size="small"
            label={`${session.threats} threat${session.threats > 1 ? "s" : ""} reached`}
            sx={(theme: Theme) => ({
              borderRadius: "6px",
              bgcolor: theme.vars.palette.Alert.errorStandardBg,
              color: theme.vars.palette.Alert.errorColor,
              "& .MuiChip-label": { color: "inherit" },
            })}
          />
        ) : undefined
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
            <Section>The request you came from</Section>
            <Card
              variant="outlined"
              sx={{
                mt: 1,
                p: 2,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                {session.source.fqdn}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {stamp(session.source.time)}
              </Typography>
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor:
                        CATEGORY_COLORS[session.source.category] ??
                        "text.disabled",
                    }}
                  />
                  <Typography variant="body2">
                    {session.source.category}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  icon={
                    <MaterialSymbol
                      name={
                        session.source.result === "Allowed" ? "check" : "block"
                      }
                      size={16}
                    />
                  }
                  label={session.source.result}
                  sx={(theme: Theme) => ({
                    borderRadius: "6px",
                    bgcolor:
                      session.source.result === "Allowed"
                        ? theme.vars.palette.Alert.successStandardBg
                        : theme.vars.palette.Alert.errorStandardBg,
                    color:
                      session.source.result === "Allowed"
                        ? theme.vars.palette.Alert.successColor
                        : theme.vars.palette.Alert.errorColor,
                    "& .MuiChip-icon, & .MuiChip-label": { color: "inherit" },
                  })}
                />
              </Box>
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
                    <Box
                      component="tr"
                      key={process.pid}
                      sx={
                        process.source ? { bgcolor: "action.hover" } : undefined
                      }
                    >
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

          <Box>
            <Section>{`Why this session says ${session.app}`}</Section>
            <Typography sx={{ mt: 1, color: "text.primary" }}>
              {session.why}
            </Typography>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
