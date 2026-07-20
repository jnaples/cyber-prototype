// MSP → Settings ("Organization Settings"). Tabbed org-level admin surface;
// the Settings tab holds the security + privacy controls (MFA, SSO, and the
// "Limit Display of Personal Data" PII redaction settings). Other tabs are
// placeholders for this prototype.

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Radio,
  RadioGroup,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import type { Theme } from "@mui/material/styles";
import React, { useState } from "react";

import { DataTable } from "@/components/data-table";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { TabbedDataCard } from "@/components/tabbed-data-card";

const ORG_NAME = "Test Lab";

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const TABS = [
  { label: "Profile", icon: "public" },
  { label: "Users", icon: "group" },
  { label: "Whitelabel", icon: "sell" },
  { label: "Billing", icon: "credit_card" },
  { label: "Subscriptions", icon: "groups" },
  { label: "Settings", icon: "settings" },
] as const;

const SETTINGS_TAB = TABS.length - 1;

const selectedTabSx = {
  "&.Mui-selected": {
    backgroundColor: (theme: Theme) =>
      theme.vars?.palette.background.paper ?? theme.palette.background.paper,
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    boxShadow: (theme: Theme) => theme.shadows[3],
    zIndex: (theme: Theme) => theme.zIndex.appBar,
  },
};

// ---------------------------------------------------------------------------
// Privacy (master) modes
// ---------------------------------------------------------------------------

const PRIVACY_MODES = [
  {
    value: "standard",
    label: "Standard (Default)",
    desc: "Includes user names, device hostnames, and device IPs in logs, reporting, and exports. Provides full attribution for troubleshooting and policy enforcement.",
  },
  {
    value: "device-only",
    label: "Device-Only",
    desc: "Redacts user identifiers while keeping device hostnames visible in the UI and query logs. Device details are excluded from exports.",
  },
  {
    value: "maximum",
    label: "Maximum Privacy",
    desc: "Redacts all personal identifiers—including user names and device hostnames—from logs, reporting, and exports. Device hostnames remain visible from Roaming Client Management.",
  },
] as const;

// ---------------------------------------------------------------------------
// Organization overrides table
// ---------------------------------------------------------------------------

function OverrideActionsCell() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: "100%" }}>
      <MaterialSymbol
        name="edit"
        size={20}
        sx={{ color: "text.secondary", cursor: "pointer" }}
      />
      <MaterialSymbol
        name="delete"
        size={20}
        sx={{ color: "error.main", cursor: "pointer" }}
      />
    </Box>
  );
}

const overrideColumns: GridColDef[] = [
  { field: "organization", headerName: "Organization Name", flex: 1, minWidth: 200 },
  {
    field: "override",
    headerName: "Data Protection Override",
    flex: 1,
    minWidth: 220,
    renderHeader: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Box component="span" sx={{ fontWeight: 600, fontSize: 14 }}>
          Data Protection Override
        </Box>
        <MaterialSymbol name="edit" size={16} sx={{ color: "text.secondary" }} />
      </Box>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
    sortable: false,
    filterable: false,
    resizable: false,
    renderCell: () => <OverrideActionsCell />,
  },
];

const overrideRows = [
  { id: 1, organization: "Doctor's Office", override: "Standard" },
  { id: 2, organization: "Vandelay Industries", override: "Maximum Privacy" },
];

// ---------------------------------------------------------------------------
// Section building blocks
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ width: "100%" }}>
      <CardContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}
      >
        <Typography variant="cardTitle">{title}</Typography>
        {children}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Settings tab content
// ---------------------------------------------------------------------------

function SettingsTab() {
  const [mfa, setMfa] = useState(false);
  const [allowOrgAdmins, setAllowOrgAdmins] = useState(true);
  const [privacyMode, setPrivacyMode] = useState<string>("standard");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Multi-Factor Authentication */}
      <SectionCard title="Multi-Factor Authentication">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Switch checked={mfa} onChange={(e) => setMfa(e.target.checked)} />
          <Typography sx={{ color: "text.primary" }}>
            Require multi-factor authentication for all users at {ORG_NAME}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Team members will be prompted to set up their verification method on
          next login. Manage your personal MFA in{" "}
          <Link href="#" underline="hover">
            account settings
          </Link>
          .
        </Typography>
      </SectionCard>

      {/* Single Sign-On */}
      <SectionCard title="Single Sign-On">
        <Typography sx={{ color: "text.primary" }}>
          You can manage SSO authentication for your tenant with any OpenID
          Connect compliant identity provider. This will enable your users to
          securely authenticate with your identity provider.
        </Typography>
        <Typography sx={{ color: "text.primary" }}>
          As an owner you will still be able to authenticate with email and
          password via the standard sign in page. If there is ever an issue with
          your SSO configuration, you will still be able to access your account.
        </Typography>
        <Typography sx={{ color: "text.primary" }}>
          DNSFilter will request openid, profile, and email for all
          authenticated users.
        </Typography>
        <Alert
          severity="info"
          icon={<MaterialSymbol name="info" size={20} />}
          sx={{ alignItems: "center" }}
        >
          Multi-Factor authentication and enforcement will be managed by your
          identity provider after SSO is configured
        </Alert>
        <Box>
          <Button variant="contained" color="primary" disabled>
            Configure Single Sign-On
          </Button>
        </Box>
      </SectionCard>

      {/* Limit Display of Personal Data */}
      <SectionCard title="Limit Display of Personal Data">
        <Typography sx={{ color: "text.primary" }}>
          Controls whether user and device identifiers appear in logs,
          reporting, and exports. Higher privacy modes reduce attribution and
          reporting visibility.
        </Typography>
        <Link href="#" underline="hover" sx={{ alignSelf: "flex-start" }}>
          View redacted data details
        </Link>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Switch
            checked={allowOrgAdmins}
            onChange={(e) => setAllowOrgAdmins(e.target.checked)}
          />
          <Typography sx={{ color: "text.primary" }}>
            Allow Organization Admins to Manage PII Data Protection Settings
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: -1 }}>
          When enabled, client Organization admins can adjust this setting
          independently. The global setting remains unchanged.
        </Typography>

        <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 1 }}>
          Master Settings (Applies to all organizations unless overridden)
        </Typography>
        <RadioGroup
          value={privacyMode}
          onChange={(e) => setPrivacyMode(e.target.value)}
          sx={{ gap: 1 }}
        >
          {PRIVACY_MODES.map((mode) => (
            <Box
              key={mode.value}
              onClick={() => setPrivacyMode(mode.value)}
              sx={{
                display: "flex",
                gap: 1,
                border: "1px solid",
                borderColor:
                  privacyMode === mode.value ? "primary.main" : "divider",
                borderRadius: 1,
                px: 2,
                py: 1.5,
                cursor: "pointer",
              }}
            >
              <Radio
                value={mode.value}
                checked={privacyMode === mode.value}
                sx={{ p: 0, mt: 0.25 }}
              />
              <Box>
                <Typography sx={{ color: "text.primary" }}>
                  {mode.label}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {mode.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </RadioGroup>

        {/* Organization Overrides */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mt: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
            Organization Overrides
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MaterialSymbol name="add" size={20} />}
          >
            Add Override
          </Button>
        </Box>
        <TabbedDataCard>
          <DataTable
            rows={overrideRows}
            columns={overrideColumns}
            showFilters={false}
            showDefaultView={false}
            showPreferences
            showRefresh
          />
        </TabbedDataCard>
      </SectionCard>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrganizationSettingsPage() {
  const [tab, setTab] = useState(SETTINGS_TAB);

  return (
    <PageShell
      maxWidth="lg"
      header={
        <PageHeader
          title="Organization Settings"
          actions={
            <Button variant="contained" color="primary" disabled>
              Save
            </Button>
          }
        >
          <Box
            sx={{
              mb: -2,
              display: "flex",
              alignContent: "flex-end",
              backgroundColor: (theme: Theme) =>
                theme.vars?.palette.background.neutral ??
                theme.palette.background.neutral,
              color: (theme: Theme) =>
                theme.vars?.palette.text.primary ?? theme.palette.text.primary,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_e: React.SyntheticEvent, v: number) => setTab(v)}
              aria-label="organization settings tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 3 }}
            >
              {TABS.map((t) => (
                <Tab
                  key={t.label}
                  label={t.label}
                  icon={<MaterialSymbol name={t.icon} size={20} />}
                  iconPosition="start"
                  sx={selectedTabSx}
                />
              ))}
            </Tabs>
          </Box>
        </PageHeader>
      }
    >
      {tab === SETTINGS_TAB ? (
        <SettingsTab />
      ) : (
        <Typography sx={{ color: "text.secondary", py: 4 }}>
          {TABS[tab].label} settings are not part of this prototype.
        </Typography>
      )}
    </PageShell>
  );
}
