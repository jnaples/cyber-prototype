// "Share with organizations" drawer — pick one or more MSP organizations to
// share the current dashboard with. The organization picker mirrors the
// multi-select (search + Select all + checkboxes) used for "All Sites" on the
// Query Logs page.

import {
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { MSP_ORGANIZATIONS } from "@/data/organizations";

const SELECT_ALL_VALUE = "__select_all__";

// Order-insensitive equality so "Save" only enables on a real change.
function sameSelection(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

export function ShareWithOrganizationsDrawer({
  open,
  onClose,
  onSave,
  initial = [],
}: {
  open: boolean;
  onClose: () => void;
  /** Called with the selected organizations when the user saves. */
  onSave: (organizations: string[]) => void;
  /** Organizations already shared with — seeds the picker on open. */
  initial?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [search, setSearch] = useState("");

  // Re-seed the selection from the current sharing state + clear search on open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelected(initial);
      setSearch("");
    }
  }

  const total = MSP_ORGANIZATIONS.length;
  const allSelected = selected.length === total;
  const someSelected = selected.length > 0 && selected.length < total;

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const raw = event.target.value;
    const next = typeof raw === "string" ? raw.split(",") : raw;
    if (next.includes(SELECT_ALL_VALUE)) {
      setSelected(allSelected ? [] : [...MSP_ORGANIZATIONS]);
      return;
    }
    setSelected(next);
  };

  const filtered = MSP_ORGANIZATIONS.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase()),
  );

  // Enabled only once the selection differs from what the drawer opened with.
  const changed = !sameSelection(selected, initial);

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Share with Organizations"
      subheader={
        selected.length > 0
          ? `${selected.length} Organization${selected.length === 1 ? "" : "s"} selected`
          : undefined
      }
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: "Save",
        onClick: handleSave,
        disabled: !changed,
        tooltip: changed
          ? undefined
          : selected.length === 0
            ? "Select an Organization to share with."
            : "Make a change to save.",
      }}
    >
      <Typography variant="body1" sx={{ color: "text.primary" }}>
        Choose which Organizations can see this dashboard.
      </Typography>

      <FormControl
        size="small"
        fullWidth
        sx={{
          position: "relative",
          "&:hover .select-clear, &:focus-within .select-clear": {
            visibility: "visible",
          },
        }}
      >
        <FormLabel sx={{ mb: 0.5 }}>Organizations</FormLabel>
        {selected.length > 0 && (
          <IconButton
            size="small"
            className="select-clear"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setSelected([]);
            }}
            sx={{
              position: "absolute",
              right: 32,
              top: "calc(50% + 10px)",
              transform: "translateY(-50%)",
              visibility: "hidden",
              zIndex: 1,
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        )}
        <Select
          multiple
          displayEmpty
          value={selected}
          onChange={handleChange}
          onClose={() => setSearch("")}
          renderValue={(sel) => {
            if (sel.length === 0) return "Select Organizations";
            if (allSelected) return "All Organizations";
            if (sel.length === 1) return sel[0];
            return `${sel[0]} +${sel.length - 1}`;
          }}
          MenuProps={{
            autoFocus: false,
            slotProps: { paper: { sx: { maxHeight: 400 } } },
          }}
        >
          <ListSubheader sx={{ px: 2, py: 1 }}>
            <TextField
              size="small"
              autoFocus
              fullWidth
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Escape") e.stopPropagation();
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </ListSubheader>
          <MenuItem value={SELECT_ALL_VALUE}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              sx={{ p: 0.5, mr: 1 }}
            />
            <ListItemText primary="Select all" />
          </MenuItem>
          <Divider />
          {filtered.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox
                size="small"
                checked={selected.includes(name)}
                sx={{ p: 0.5, mr: 1 }}
              />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Drawer>
  );
}
