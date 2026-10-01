// AgentShield → Filters.
//
// Everything the header's five selectors don't cover, grouped by what it
// narrows: where the traffic came from, which application made it, and what
// happened to it. Each field is a single select that opens on "All".

import { Box, MenuItem, Typography } from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { TextField } from "@/components/text-field";

import { FILTER_GROUPS } from "./filters";

/** What the drawer hands back: only the fields actually set. */
export type AgentShieldFilters = Record<string, string>;

export function FiltersDrawer({
  open,
  onClose,
  applied,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  /** What's already applied, which the drawer opens on. */
  applied: AgentShieldFilters;
  onApply: (filters: AgentShieldFilters) => void;
}) {
  // A draft, so closing without applying changes nothing.
  const [draft, setDraft] = useState<AgentShieldFilters>(applied);

  // Reopening starts from whatever is applied now.
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(applied);
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters"
      secondaryAction={{
        label: "Remove All",
        color: "error",
        variant: "text",
        onClick: () => setDraft({}),
      }}
      primaryAction={{
        label: "Apply",
        onClick: () => {
          onApply(draft);
          onClose();
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {FILTER_GROUPS.map((group) => (
          <Box
            key={group.title}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography
              variant="overline"
              sx={{ lineHeight: 1.4, color: "text.secondary" }}
            >
              {group.title}
            </Typography>
            {group.fields.map((field) => (
              <TextField
                key={field.key}
                select
                fullWidth
                size="small"
                label={field.label}
                value={draft[field.key] ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((was) => {
                    const next = { ...was };
                    if (value) next[field.key] = value;
                    else delete next[field.key];
                    return next;
                  });
                }}
              >
                <MenuItem value="">{field.all}</MenuItem>
                {field.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
