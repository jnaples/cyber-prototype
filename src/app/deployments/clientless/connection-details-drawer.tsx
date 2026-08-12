// Every way a clientless deployment's endpoint can be handed to a device, in
// one place — the create page only ever shows the one type being generated, so
// this is where an existing deployment's other formats are read off.

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Button, Divider, FormLabel, Typography } from "@mui/material";
import { Fragment } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
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
  /** Install instructions — shown on the label's info icon. */
  helper?: string;
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
        {/* The row below the label owns the spacing; the theme's own label
            margin would stack on top of it. */}
        <FormLabel sx={{ display: "block", mb: 0 }}>{label}</FormLabel>
        {helper && (
          <ArrowTooltip title={helper}>
            <InfoOutlinedIcon
              // Primary blue, lightened on dark the way CopyButton is.
              sx={(theme) => ({
                fontSize: 16,
                cursor: "help",
                color: "primary.main",
                ...theme.applyStyles("dark", {
                  color: theme.vars.palette.primary.light,
                }),
              })}
            />
          </ArrowTooltip>
        )}
      </Box>
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
      {/* One div per format holding its overline, fields and helper text; the
          rules stay outside so they span the drawer rather than a section. */}
      {DOH_TYPES.map((type, index) => {
        const field = DOH_FIELD[type];
        const endpoint = endpointFor(token, type);
        return (
          <Fragment key={type}>
            {index > 0 && <Divider />}
            <Box>
              <Typography variant="overline">{type}</Typography>
              {/* The gap only shows on Windows, the one format configured with
                  two values. */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: "4px",
                }}
              >
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
              </Box>
            </Box>
          </Fragment>
        );
      })}
    </Drawer>
  );
}
