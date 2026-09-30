// Menu Bar — the tray popup's states, grouped by whether the user is allowed
// to turn filtering off.

import { Box, Container, Divider, Typography } from "@mui/material";

import type { ReactNode } from "react";

import { TrayPopup, type TrayState } from "../tray-popup";

// One state of the popup, under the name of the state it's showing.
function Variation({
  label,
  state,
  permissions,
  features,
  toggles,
}: {
  label: string;
  state?: TrayState;
  permissions?: boolean;
  features?: boolean;
  toggles?: string[];
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: "text.primary" }}
      >
        {label}
      </Typography>
      <TrayPopup
        state={state}
        permissions={permissions}
        features={features}
        toggles={toggles}
      />
    </Box>
  );
}

// One popup to a row, 40px apart — the page reads as a single column.
function VariationRow({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {children}
    </Box>
  );
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

export default function TrayVariantsPage() {
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
              label="Permissions disabled - Not filtering, service incident"
              state="incident"
            />
            <Variation
              label="Permissions disabled - Sign-in required"
              state="sign-in"
            />
            <Variation
              label="Permissions disabled - Travel Wi-Fi on"
              state="travel-wifi"
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
              label="Permissions enabled - Not filtering, service incident"
              state="incident"
              permissions
            />
            <Variation
              label="Permissions enabled - Sign-in required"
              state="sign-in"
              permissions
            />
            <Variation
              label="Permissions enabled - Travel Wi-Fi on"
              state="travel-wifi"
              permissions
            />
          </VariationRow>
        </Section>

        <Divider />

        {/* Every feature the client ships, not just DNS filtering. */}
        <Section title="Permissions enabled - All features">
          <VariationRow>
            <Variation
              label="Permissions enabled - Online"
              permissions
              features
            />
            {/* The same popup, where SecureTransit is the only thing the user
                is allowed to turn off. */}
            <Variation
              label="SecureTransit permissions enabled - Online"
              features
              toggles={["SecureTransit"]}
            />
          </VariationRow>
        </Section>
      </Box>
    </Container>
  );
}
