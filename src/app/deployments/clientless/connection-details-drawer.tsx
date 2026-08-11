// Every way a clientless deployment's endpoint can be handed to a device, in
// one place — the create page only ever shows the one type being generated, so
// this is where an existing deployment's other formats are read off.

import { Box, Button, Divider, FormLabel, Typography } from "@mui/material";
import { Fragment } from "react";

import { CopyButton } from "@/components/copy-button";
import { Drawer } from "@/components/drawer";
import { TextField } from "@/components/text-field";

import { DOH_FIELD, DOH_TYPES, RESOLVER_IP, endpointFor } from "./doh";

// The value reads like a real field but can't be selected, so the copy button
// is the only way to take it — same treatment as the create page.
const readOnlyFieldSx = {
  "& .MuiOutlinedInput-root": { bgcolor: "background.neutral" },
  "& .MuiOutlinedInput-input": {
    fontFamily: "monospace",
    userSelect: "none",
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "var(--dnsf-palette-text-secondary)",
    WebkitTextFillColor: "var(--dnsf-palette-text-secondary)",
    opacity: 1,
  },
} as const;

function ReadOnlyField({
  label,
  value,
  copyLabel,
  helper,
}: {
  label: string;
  value: string;
  copyLabel: string;
  /** Install instructions, sat with the field they describe. */
  helper?: string;
}) {
  return (
    <Box>
      <FormLabel sx={{ display: "block", mb: 0.5 }}>{label}</FormLabel>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          fullWidth
          disabled
          value=""
          placeholder={value}
          sx={readOnlyFieldSx}
        />
        <CopyButton value={value} label={copyLabel} />
      </Box>
      {helper && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: "4px" }}>
          {helper}
        </Typography>
      )}
    </Box>
  );
}

export function ConnectionDetailsDrawer({
  open,
  onClose,
  name,
  token,
}: {
  open: boolean;
  onClose: () => void;
  /** Deployment name — shown under the title so the drawer names its subject. */
  name: string;
  /** The deployment's endpoint ID, which every format is built from. */
  token: string;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="DoH Endpoint"
      subheader={name}
      actions={
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        Use the format the device supports. All four point at the same endpoint
        and the same policy.
      </Typography>

      {/* Flat children, so the rules and the fields are all siblings spaced by
          the drawer's own 16px content gap rather than nested wrappers. */}
      {DOH_TYPES.map((type, index) => {
        const field = DOH_FIELD[type];
        const endpoint = endpointFor(token, type);
        return (
          <Fragment key={type}>
            {index > 0 && <Divider />}
            {/* Windows is configured with the resolver IP as well as the URL. */}
            {type === "Windows" && (
              <ReadOnlyField
                label="Resolver IP"
                value={RESOLVER_IP}
                copyLabel="Copy resolver IP"
              />
            )}
            <ReadOnlyField
              label={field.label}
              value={endpoint}
              copyLabel={`Copy ${field.label}`}
              helper={field.helper}
            />
          </Fragment>
        );
      })}
    </Drawer>
  );
}
