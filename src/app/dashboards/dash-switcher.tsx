// Dashboard switcher dropdown — search at top, Favorites section, Other
// dashboards section, and a "Manage Dashboards" action pinned at the bottom.

import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Popper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { DASHBOARD_NAMES } from "./lib";

const ALL_DASHBOARDS = DASHBOARD_NAMES;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: "block",
        color: "text.secondary",
        px: 1.25,
        pt: 1.25,
        pb: 0,
      }}
    >
      {children}
    </Typography>
  );
}

function DashRow({
  name,
  current,
  isFav,
  onPick,
  onToggleFav,
}: {
  name: string;
  current: string;
  isFav: boolean;
  onPick: (n: string) => void;
  onToggleFav: (e: React.MouseEvent, n: string) => void;
}) {
  const selected = name === current;
  return (
    <Box
      role="button"
      onClick={() => onPick(name)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        bgcolor: selected ? "rgba(53,39,253,.08)" : "transparent",
        borderRadius: 1,
        px: 1.25,
        py: 1,
        fontSize: 14,
        fontWeight: 500,
        color: "text.primary",
        "&:hover": {
          bgcolor: selected ? "rgba(53,39,253,.08)" : "action.hover",
        },
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </Box>
      <IconButton
        size="small"
        onClick={(e) => onToggleFav(e, name)}
        title={isFav ? "Unfavorite" : "Add to favorites"}
        sx={(theme) => ({
          p: 0.25,
          color: isFav ? "warning.main" : "text.disabled",
          ...(isFav &&
            theme.applyStyles("dark", {
              color: theme.vars.palette.primary.light,
            })),
        })}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 20,
            fontVariationSettings: isFav ? '"FILL" 1' : '"FILL" 0',
          }}
        >
          star
        </span>
      </IconButton>
    </Box>
  );
}

export function DashSwitcher({
  anchorEl,
  open,
  current,
  onPick,
  onManage,
  onClose,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  current: string;
  onPick: (name: string) => void;
  onManage: () => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<string[]>([
    "FilterDNS Overview",
    "Security Summary",
  ]);
  const toggleFav = (e: React.MouseEvent, n: string) => {
    e.stopPropagation();
    setFavs((f) => (f.includes(n) ? f.filter((x) => x !== n) : [...f, n]));
  };
  const match = (n: string) => n.toLowerCase().includes(q.toLowerCase());
  const favList = ALL_DASHBOARDS.filter((n) => favs.includes(n) && match(n));
  const otherList = ALL_DASHBOARDS.filter(
    (n) => !favs.includes(n) && match(n),
  );

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: (t) => t.zIndex.modal }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={8}
          sx={{
            width: 320,
            maxWidth: "calc(100vw - 60px)",
            mt: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
            <TextField
              fullWidth
              autoFocus
              size="small"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dashboards"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 18,
                          color: "var(--dnsf-palette-text-disabled)",
                        }}
                      >
                        search
                      </span>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", maxHeight: 360, p: 0.75 }}>
            {favList.length > 0 && (
              <>
                <SectionLabel>Favorites</SectionLabel>
                {favList.map((n) => (
                  <DashRow
                    key={n}
                    name={n}
                    current={current}
                    isFav
                    onPick={onPick}
                    onToggleFav={toggleFav}
                  />
                ))}
              </>
            )}
            {favList.length > 0 && otherList.length > 0 && <Divider />}
            {otherList.length > 0 && (
              <>
                <SectionLabel>Other dashboards</SectionLabel>
                {otherList.map((n) => (
                  <DashRow
                    key={n}
                    name={n}
                    current={current}
                    isFav={false}
                    onPick={onPick}
                    onToggleFav={toggleFav}
                  />
                ))}
              </>
            )}
            {favList.length === 0 && otherList.length === 0 && (
              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.disabled",
                  textAlign: "center",
                  px: 1.25,
                  py: 2,
                }}
              >
                No dashboards match &ldquo;{q}&rdquo;.
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              px: 0.75,
              py: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Button
              variant="text"
              color="secondary"
              fullWidth
              onClick={onManage}
              startIcon={
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16 }}
                >
                  dashboard
                </span>
              }
              sx={{ justifyContent: "flex-start" }}
            >
              Manage Dashboards
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
