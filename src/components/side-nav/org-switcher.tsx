// Side-nav organization switcher: a search field trigger that opens a dark
// panel with the MSP dashboard (current selection) and a searchable list of
// organizations, plus an "Add organization" action.

import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  InputAdornment,
  Paper,
  Popper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

const byName = (a: string, b: string) => a.localeCompare(b);

const MSP_DASHBOARDS = ["TechsRUs", "MSPDash"].sort(byName);
const ORGANIZATIONS = [
  "Riverside Dental Group",
  "Summit Financial Advisors",
  "Coastal Property Mgmt",
  "Bright Future Pediatrics",
  "Vanguard Auto Repair",
  "Northwind Traders",
  "Acme Retail Group",
  "Lakeside Law Group",
].sort(byName);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: "block",
        px: 2,
        pt: 1.5,
        pb: 0.5,
        color: "rgba(255, 255, 255, 0.6)",
      }}
    >
      {children}
    </Typography>
  );
}

export function OrgSwitcher() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(MSP_DASHBOARDS[0]);
  const open = Boolean(anchorEl);

  const openPanel = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : e.currentTarget);
    setQ("");
  };
  const close = () => setAnchorEl(null);

  const pick = (org: string) => {
    setSelected(org);
    close();
  };

  const matches = ORGANIZATIONS.filter((o) =>
    o.toLowerCase().includes(q.toLowerCase()),
  );

  const rowSx = (isSelected: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: 2,
    py: 1,
    cursor: "pointer",
    color: "#ffffff",
    fontSize: 16,
    borderRadius: "6px",
    backgroundColor: isSelected ? "primary.main" : "transparent",
    "&:hover": {
      backgroundColor: isSelected
        ? "primary.main"
        : "rgba(255, 255, 255, 0.08)",
    },
  });

  return (
    <Box data-mui-color-scheme="dark" sx={{ px: 1, pt: 2, pb: 1 }}>
      {/* Trigger */}
      <Box
        onClick={openPanel}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: "6px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          cursor: "pointer",
          color: "#ffffff",
        }}
      >
        <MaterialSymbol name="search" size={18} />
        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selected}
        </Box>
        <MaterialSymbol name={open ? "expand_less" : "expand_more"} size={20} />
      </Box>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={close}>
          <Paper
            data-mui-color-scheme="dark"
            elevation={8}
            sx={{
              mt: 0.5,
              borderRadius: "8px",
              maxHeight: 400,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "background.paper",
              backgroundImage: "none",
            }}
          >
            {/* Pinned header: search */}
            <Box sx={{ flexShrink: 0, px: 1, pt: 1, pb: 1 }}>
              <TextField
                fullWidth
                size="small"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search organizations"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MaterialSymbol name="search" size={18} />
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

            {/* Scrollable content: MSP dashboard + organizations */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1 }}>
              <SectionLabel>MSP Dashboard</SectionLabel>
              {MSP_DASHBOARDS.map((msp) => (
                <Box
                  key={msp}
                  sx={rowSx(msp === selected)}
                  onClick={() => pick(msp)}
                >
                  <MaterialSymbol name="language" size={20} />
                  <Box component="span">{msp}</Box>
                </Box>
              ))}

              <Divider
                sx={{ my: 1, borderColor: "rgba(255, 255, 255, 0.12)" }}
              />

              <SectionLabel>MSP Organizations</SectionLabel>
              {matches.map((org) => (
                <Box key={org} sx={rowSx(false)} onClick={() => pick(org)}>
                  <MaterialSymbol name="corporate_fare" size={20} />
                  <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                    {org}
                  </Box>
                </Box>
              ))}
              {matches.length === 0 && (
                <Typography
                  sx={{
                    px: 1,
                    py: 1.5,
                    fontSize: 14,
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  No organizations match &ldquo;{q}&rdquo;.
                </Typography>
              )}
            </Box>

            {/* Pinned footer: Add organization */}
            <Box sx={{ flexShrink: 0 }}>
              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
              <Box sx={{ p: 1 }}>
                <Button
                  variant="text"
                  color="secondary"
                  onClick={close}
                  startIcon={<MaterialSymbol name="add" size={20} />}
                  sx={{
                    justifyContent: "flex-start",
                    width: "100%",
                    color: "#ffffff",
                  }}
                >
                  Add Organization
                </Button>
              </Box>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
