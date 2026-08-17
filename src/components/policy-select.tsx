// The app's policy picker: the organization's own policies, then the global
// ones (marked with a globe), under caption-style section headers. Shared so
// every surface that assigns a policy — Add Clientless Device, the Approve
// Request drawer — offers the same list in the same shape.

import { Box, Checkbox, ListSubheader, MenuItem } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

import { InfoChip } from "@/components/info-chip";
import { MaterialSymbol } from "@/components/material-symbol";
import { Select } from "@/components/select";
import type { SelectProps } from "@/components/select";

const POLICY_OPTIONS = [
  "Standard Policy",
  "Restricted Policy",
  "HIPAA Strict",
  "CIPA Policy",
  "Default Policy",
];

const GLOBAL_POLICY_OPTIONS = [
  "Global Baseline",
  "Global Threat Defense",
  "Global Compliance",
];

// Caption-style section header (slightly indented).
const subheaderSx = (theme: Theme) => ({
  ...theme.typography.caption,
  pl: 2,
  lineHeight: "32px",
  textTransform: "uppercase" as const,
  color: theme.vars.palette.text.secondary,
});

// Items sit more indented than their section header.
const policyItemSx = { pl: 3.5 } as const;

// The globe that marks a policy as global — sits right beside the name.
function GlobalMark() {
  return (
    <MaterialSymbol
      name="globe"
      size={20}
      sx={{ ml: 1, color: "text.secondary" }}
    />
  );
}

type Common = {
  /** Shown while nothing is selected. */
  placeholder?: ReactNode;
  /** Passed through to Select: suppress the ✕ clear affordance. */
  disableClear?: boolean;
  /** The policy already in force — flagged in the list with a chip, and added
   *  to the organization section if it isn't one of the stock policies. */
  currentPolicy?: string;
};

type SingleProps = Common & {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiProps = Common & {
  /** Checkbox list; `value` and `onChange` deal in arrays. */
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export function PolicySelect({
  value,
  onChange,
  placeholder = "-",
  multiple,
  currentPolicy,
  sx,
  ...props
}: Omit<
  SelectProps<string | string[]>,
  "children" | "renderValue" | "onChange" | "value" | "multiple"
> &
  (SingleProps | MultiProps)) {
  // Checked state in the multi list, and the summary in the closed field.
  const selectedList = multiple ? value : [];
  const isChecked = (policy: string) => selectedList.includes(policy);

  // A caller's current policy may be outside the stock list (every request
  // carries its own), so make sure it's offered.
  const orgOptions =
    currentPolicy &&
    !POLICY_OPTIONS.includes(currentPolicy) &&
    !GLOBAL_POLICY_OPTIONS.includes(currentPolicy)
      ? [currentPolicy, ...POLICY_OPTIONS]
      : POLICY_OPTIONS;

  const item = (policy: string, global: boolean) => (
    <MenuItem
      key={policy}
      value={policy}
      sx={multiple ? { pl: 1.5 } : policyItemSx}
    >
      {/* 18px glyph — the size the data grids paint their selection boxes at
          (see the MuiCheckbox rule in data-table). */}
      {multiple && (
        <Checkbox
          checked={isChecked(policy)}
          sx={{
            p: 0.5,
            mr: 1,
            "& .MuiSvgIcon-root": { width: 18, height: 18 },
          }}
        />
      )}
      {/* Name (and its globe) take the room the chip leaves; a long name
          truncates rather than pushing the chip out of the row. */}
      <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
        <Box
          component="span"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {policy}
        </Box>
        {global && <GlobalMark />}
      </Box>
      {policy === currentPolicy && (
        <InfoChip label="Current Policy" sx={{ ml: 1 }} />
      )}
    </MenuItem>
  );

  return (
    <Select<string | string[]>
      fullWidth
      displayEmpty
      // A disabled picker says so on hover rather than looking clickable.
      sx={[
        {
          "&.Mui-disabled, & .MuiSelect-select.Mui-disabled": {
            cursor: "not-allowed",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      multiple={multiple}
      value={value}
      onChange={(e) =>
        multiple
          ? (onChange as MultiProps["onChange"])(e.target.value as string[])
          : (onChange as SingleProps["onChange"])(e.target.value as string)
      }
      renderValue={(selected) => {
        // One policy reads by name; several read as the first name plus a
        // count of the rest, so the closed field never runs long.
        const list = Array.isArray(selected) ? selected : [selected as string];
        const [first, ...rest] = list.filter(Boolean);
        return first ? (
          rest.length ? (
            `${first}, +${rest.length}`
          ) : (
            first
          )
        ) : (
          <Box component="span" sx={{ color: "text.disabled" }}>
            {placeholder}
          </Box>
        );
      }}
      {...props}
    >
      <ListSubheader sx={subheaderSx}>Organization</ListSubheader>
      {orgOptions.map((policy) => item(policy, false))}
      <ListSubheader sx={subheaderSx}>Global</ListSubheader>
      {GLOBAL_POLICY_OPTIONS.map((policy) => item(policy, true))}
    </Select>
  );
}
