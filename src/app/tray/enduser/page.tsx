// Enduser Tray — the popup's states, grouped by whether the user is allowed
// to turn filtering off.

import { Box, Container, Divider, Typography } from "@mui/material";

import type { ReactNode } from "react";

import { TrayPopup, type TrayState } from "../tray-popup";

// One state of the popup, under the name of the state it's showing.
function Variation({
  label,
  state,
  permissions,
}: {
  label: string;
  state?: TrayState;
  permissions?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: "text.primary" }}
      >
        {label}
      </Typography>
      <TrayPopup state={state} permissions={permissions} />
    </Box>
  );
}

// Two popups to a row, 40px apart.
function VariationRow({ children }: { children: ReactNode }) {
  return <Box sx={{ display: "flex", gap: "40px" }}>{children}</Box>;
}

// A set of variations under its own title.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="cardTitle" sx={{ display: "block", mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {children}
      </Box>
    </Box>
  );
}

export default function EnduserTrayPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        <Section title="Permissions disabled">
          <VariationRow>
            <Variation label="Permissions disabled - Online" />
            <Variation
              label="Permissions disabled - No connection"
              state="no-connection"
            />
          </VariationRow>
          <VariationRow>
            <Variation
              label="Permissions disabled - Can't reach service"
              state="unreachable"
            />
            <Variation
              label="Permissions disabled - Not filtering"
              state="not-filtering"
            />
          </VariationRow>
          <VariationRow>
            <Variation
              label="Permissions disabled - Not protected"
              state="incident"
            />
          </VariationRow>
        </Section>

        <Divider />

        {/* The same states, plus the switch. */}
        <Section title="Permissions enabled">
          <VariationRow>
            <Variation label="Permissions enabled - Online" permissions />
            <Variation
              label="Permissions enabled - No connection"
              state="no-connection"
              permissions
            />
          </VariationRow>
          <VariationRow>
            <Variation
              label="Permissions enabled - Can't reach service"
              state="unreachable"
              permissions
            />
            <Variation
              label="Permissions enabled - Not filtering"
              state="not-filtering"
              permissions
            />
          </VariationRow>
          <VariationRow>
            <Variation
              label="Permissions enabled - Turned off by user"
              state="turned-off"
              permissions
            />
            <Variation
              label="Permissions enabled - Not protected"
              state="incident"
              permissions
            />
          </VariationRow>
        </Section>
      </Box>
    </Container>
  );
}
