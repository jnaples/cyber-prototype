// The scope chip beside a page title. Unscoped it reads "Managing N
// Organizations" and opens the drill-down; once an organization is picked it
// becomes the way back out, so the chip is both the filter and its own undo.

import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";
import { OrganizationDrillDownDrawer } from "@/components/organization-drill-down-drawer";

export function OrganizationScopeChip({
  organization,
  onSelect,
  onClear,
  count = 8,
}: {
  /** The organization in scope, or null for all of them. */
  organization: string | null;
  onSelect: (organization: string) => void;
  onClear: () => void;
  /** How many organizations the MSP manages, shown while unscoped. */
  count?: number;
}) {
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const scoped = organization !== null;

  return (
    <>
      <Chip
        label={
          scoped ? "Managing 1 Organization" : `Managing ${count} Organizations`
        }
        size="small"
        // Scoped, the chip steps back out; unscoped, it drills in.
        onClick={scoped ? onClear : () => setDrillDownOpen(true)}
        icon={
          scoped ? (
            <MaterialSymbol
              name="chevron_left"
              size={20}
              sx={{ color: "secondary.main" }}
            />
          ) : undefined
        }
        deleteIcon={
          scoped ? undefined : (
            <MaterialSymbol
              name="filter_list"
              size={20}
              sx={{ color: "secondary.main" }}
            />
          )
        }
        onDelete={scoped ? undefined : () => setDrillDownOpen(true)}
        sx={(theme) => ({
          borderRadius: "8px",
          fontSize: "14px",
          "& .MuiChip-icon, & .MuiChip-deleteIcon": { color: "secondary.main" },
          // It behaves like a button, so it answers the pointer like one.
          "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.16) },
          ...theme.applyStyles("dark", {
            "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.16) },
          }),
        })}
      />
      <OrganizationDrillDownDrawer
        open={drillDownOpen}
        onClose={() => setDrillDownOpen(false)}
        onSelect={(picked) => {
          setDrillDownOpen(false);
          onSelect(picked);
        }}
      />
    </>
  );
}
