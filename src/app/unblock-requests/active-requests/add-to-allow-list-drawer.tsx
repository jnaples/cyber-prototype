// "Add to Allow list" drawer — opened from the Active Requests row action.
// Lets an admin note why a domain is being allowed, choose whether CNAMEs are
// included, and pick which policies (or a universal / all-policies shortcut)
// the allow entry applies to. Policy list is placeholder data.

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

// Placeholder policies the allow entry can be scoped to.
type Policy = { name: string; detail: string; icon?: string };
const POLICIES: Policy[] = [
  { name: "Global Policy", detail: "4 sites, 100 roaming clients", icon: "public" },
  { name: "Policy 1", detail: "34 sites, 90 roaming clients" },
  { name: "Policy 2", detail: "5 sites, 55 roaming clients" },
  { name: "Policy 3", detail: "10 sites, 1,500 roaming clients" },
];

export function AddToAllowListDrawer({
  open,
  onClose,
  domain,
}: {
  open: boolean;
  onClose: () => void;
  /** Domain being allowed — shown read-only at the top of the form. */
  domain?: string;
}) {
  const [notes, setNotes] = useState("");
  const [includeCnames, setIncludeCnames] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Reset the form each time the drawer opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setNotes("");
      setIncludeCnames(false);
      setSelected([]);
      setSearch("");
    }
  }

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  const filtered = POLICIES.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const canSave = selected.length > 0;

  const handleSave = () => {
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add to Allow list"
      subheader={
        selected.length > 0
          ? `${selected.length} ${selected.length === 1 ? "policy" : "policies"} selected`
          : undefined
      }
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: "Save",
        onClick: handleSave,
        disabled: !canSave,
        tooltip: canSave ? undefined : "Select at least one policy.",
      }}
    >
      {/* Domain (read-only) */}
      <Box>
        <FormLabel sx={{ mb: 0.5, display: "block" }}>Domain</FormLabel>
        <TextField
          fullWidth
          variant="standard"
          value={domain ?? ""}
          slotProps={{
            input: {
              readOnly: true,
              disableUnderline: true,
            },
          }}
          sx={{
            "& .MuiInputBase-input": {
              color: "text.primary",
              p: 0,
              cursor: "default",
            },
          }}
        />
      </Box>

      {/* Notes */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Optional
          </Typography>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Add your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
        />
      </Box>

      {/* Include CNAMEs */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={includeCnames}
              onChange={(e) => setIncludeCnames(e.target.checked)}
              sx={{ p: 0.5, mr: 1 }}
            />
          }
          label={
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
              Include CNAMEs
            </Typography>
          }
          sx={{ m: 0 }}
        />
        <ArrowTooltip title="Also allow domains that resolve to this domain via CNAME records.">
          <Box sx={{ display: "inline-flex", color: "primary.main" }}>
            <MaterialSymbol name="info" size={18} />
          </Box>
        </ArrowTooltip>
      </Box>

      {/* Policy scope */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
          {POLICIES.length} Policies Available
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<MaterialSymbol name="verified_user" size={20} />}
          >
            Allow in all policies
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<MaterialSymbol name="playlist_add" size={20} />}
          >
            Add to universal allow list
          </Button>
        </Box>

        <TextField
          size="small"
          fullWidth
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filtered.map((policy) => (
            <Box
              key={policy.name}
              onClick={() => toggle(policy.name)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "background.paper",
                boxShadow: 1,
                borderRadius: 1,
                px: 1.5,
                py: 1,
                cursor: "pointer",
              }}
            >
              <Checkbox
                size="small"
                checked={selected.includes(policy.name)}
                onChange={() => toggle(policy.name)}
                onClick={(e) => e.stopPropagation()}
                sx={{ p: 0.5 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography sx={{ fontSize: 14, color: "text.primary" }}>
                    {policy.name}
                  </Typography>
                  {policy.icon && (
                    <MaterialSymbol
                      name={policy.icon}
                      size={18}
                      sx={{ color: "text.primary" }}
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {policy.detail}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
}
