// Clean Up — finding the clientless devices that have gone quiet and taking
// them off the dashboard.
//
// The same drawer Roaming Clients offers, worded for clientless devices: pick
// how long a device has to have been inactive, then run it once.

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Link,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";
import { OrgScopeSlot } from "@/components/org-scope-slot";
import { Select } from "@/components/select";

/** How far back a device has to have been quiet to be swept up. */
const INACTIVITY_PERIODS = [
  "Last 365 days",
  "Last 180 days",
  "Last 90 days",
  "Last 60 days",
  "Last 30 days",
  "Last 7 days",
  "Last day",
  "Custom",
];

/** How many devices each period catches — the longer the window, the more
 *  have gone quiet inside it. */
const STALE_BY_PERIOD: Record<string, number> = {
  "Last 365 days": 12,
  "Last 180 days": 8,
  "Last 90 days": 3,
  "Last 60 days": 2,
  "Last 30 days": 1,
  "Last 7 days": 0,
  "Last day": 0,
  Custom: 3,
};

/** The devices a run would take, named in the order the grid lists them. */
const STALE_DEVICES = [
  "Riverside Clinic — Guest",
  "Austin Office — Lobby",
  "Berlin Hub — Conference",
  "Boston Lab — Imaging",
  "Chicago HQ — Reception",
  "London Branch — Guest",
  "Dallas Branch — Kiosk",
  "Tampa Branch — Waiting Room",
  "Miami Branch — Guest",
  "Denver Branch — Lobby",
  "Seattle Branch — Guest",
  "Phoenix Branch — Kiosk",
];

/** The in-copy toggle: type, not a control, apart from the pointer. */
const SHOW_TOGGLE_SX = {
  p: 0,
  border: 0,
  background: "none",
  cursor: "pointer",
  fontWeight: 600,
  color: "text.primary",
};

export function CleanupDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState("");
  const stale = period ? (STALE_BY_PERIOD[period] ?? 0) : 0;
  const devices = STALE_DEVICES.slice(0, stale);
  // The rest of what cleanup does, folded away until it's asked for.
  const [expanded, setExpanded] = useState(false);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Clean Up"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Which organizations this would run against — its own band, inset
            8px, bled to the drawer's edges. */}
        <Box
          sx={{
            mx: -2,
            mt: -2,
            p: "8px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <OrgScopeSlot />
        </Box>
        <Divider sx={{ mx: -2, mt: -2 }} />

        {/* Collapsed it's one line with the way in; expanded it's the whole
            explanation, with the way back under it. */}
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Identify and remove stale clientless devices from the dashboard.
            {expanded ? (
              <>
                {" "}
                Anything removed moves to Recently Deleted, where it can be
                restored for 90 days before it is deleted permanently. This is
                useful for keeping your clientless device count up to date.{" "}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  sx={{ fontWeight: 600 }}
                >
                  Learn more
                </Link>
              </>
            ) : (
              <>
                {" "}
                <Typography
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setExpanded(true)}
                  sx={SHOW_TOGGLE_SX}
                >
                  Show More
                </Typography>
              </>
            )}
          </Typography>

          {expanded && (
            <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
              <Typography
                component="button"
                type="button"
                variant="body2"
                onClick={() => setExpanded(false)}
                sx={SHOW_TOGGLE_SX}
              >
                Show Less
              </Typography>
            </Box>
          )}
        </Box>

        <Box>
          <Typography
            variant="overline"
            sx={{ display: "block", lineHeight: 1.4, color: "text.secondary" }}
          >
            One-time clean up
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <FormLabel>Inactivity Period</FormLabel>
            <Select
              displayEmpty
              value={period}
              onChange={(event) => setPeriod(event.target.value as string)}
              renderValue={(selected) =>
                selected ? (
                  (selected as string)
                ) : (
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{ color: "text.disabled" }}
                  >
                    Select a period
                  </Typography>
                )
              }
            >
              {INACTIVITY_PERIODS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {period && (
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              Devices with no queries in this period will be removed.
            </Typography>
          )}
        </Box>

        {/* What the chosen period would actually take, and the two ways out
            of it. */}
        {period && (
          // The card and the way out of it read as one block.
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Alert
                severity="warning"
                icon={<MaterialSymbol name="warning" size={20} />}
                // Orange 900 on light, orange 300 on dark — the two ends of
                // the ramp the warning palette is built from.
                sx={(theme) => ({
                  color: "#BF360C",
                  "& .MuiAlertTitle-root, & .MuiAlert-icon": {
                    color: "inherit",
                  },
                  ...theme.applyStyles("dark", { color: "#FFB74D" }),
                })}
              >
                <AlertTitle>
                  {stale === 0
                    ? "No clientless devices match this period"
                    : `Are you sure you want to delete ${stale} clientless device${stale > 1 ? "s" : ""}?`}
                </AlertTitle>
                {stale === 0
                  ? "Nothing has been quiet this long. Choose a longer period to catch more devices."
                  : "Deleted devices move to Recently Deleted, where they can be restored for 90 days. Until they are restored their traffic is no longer filtered by DNSFilter or attributed to this organization."}
              </Alert>

              {stale > 0 && (
                <>
                  {/* The list itself, as a plain dropdown — nothing here is
                      chosen, it's just what the run would take. */}
                  <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                    <Select
                      displayEmpty
                      value=""
                      renderValue={() => "Clientless devices to be deleted"}
                    >
                      {devices.map((device) => (
                        <MenuItem key={device} value={device}>
                          {device}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Button variant="outlined" color="secondary" size="small">
                      View devices in table
                    </Button>
                    <Button variant="contained" color="error" size="small">
                      Delete
                    </Button>
                  </Box>
                </>
              )}
            </Card>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="text"
                color="secondary"
                size="small"
                onClick={() => setPeriod("")}
              >
                Cancel clean up request
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
