// "Organization Drill Down" — the panel behind the org-scope chip. Its own
// component so any surface that needs the drill-down (page headers today,
// widgets and reports later) opens the same panel.

import { Box, ButtonBase, InputAdornment, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";
import { TextField } from "@/components/text-field";
import { MSP_ORGANIZATIONS } from "@/data/organizations";

export function OrganizationDrillDownDrawer({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  /** Fired with the organization the user drilled into. */
  onSelect: (organization: string) => void;
}) {
  const [search, setSearch] = useState("");

  const matches = MSP_ORGANIZATIONS.filter((organization) =>
    organization.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Organization Drill Down"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Search..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MaterialSymbol
                  name="search"
                  size={20}
                  sx={{ color: "inherit" }}
                />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* The same organizations the side-nav switcher lists; each row drills
          into that one. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {matches.map((organization) => (
          <ButtonBase
            key={organization}
            onClick={() => onSelect(organization)}
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              p: "6px 16px",
              borderRadius: 1,
              textAlign: "left",
              // Each row reads as a card on the drawer's neutral body.
              bgcolor: "background.paper",
              boxShadow: theme.shadows[1],
              "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.04) },
              ...theme.applyStyles("dark", {
                "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.08) },
              }),
            })}
          >
            <Typography variant="body1">{organization}</Typography>
            <MaterialSymbol
              name="filter_list"
              size={20}
              sx={{ color: "text.secondary" }}
            />
          </ButtonBase>
        ))}
        {matches.length === 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No organizations match “{search}”.
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}
