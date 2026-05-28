import { Button, IconButton, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import type { GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { AndroidIcon } from "@/components/icons/os-icons";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns: GridColDef[] = [
  { field: "hostname", headerName: "Hostname", flex: 1, minWidth: 150 },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 120,
    headerAlign: "center",
    renderCell: () => (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <ArrowTooltip title="Protected" direction="bottom">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 22, color: "var(--dnsf-palette-success-main)" }}
          >
            verified_user
          </span>
        </ArrowTooltip>
      </Box>
    ),
  },
  {
    field: "agentOS",
    headerName: "Agent OS",
    flex: 0.7,
    minWidth: 90,
    renderCell: (params) => {
      const val: string = params.value ?? "";
      const lower = val.toLowerCase();
      let icon: React.ReactNode = null;
      if (lower === "windows") icon = <img src="/windows.svg" alt="Windows" width={20} height={20} />;
      else if (lower === "macos") icon = <img src="/mac.svg" alt="macOS" width={20} height={20} />;
      else if (lower === "ios") icon = <img src="/ios.svg" alt="iOS" width={20} height={20} />;
      else if (lower === "android") icon = <AndroidIcon size={20} />;
      if (!icon) return null;
      return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <ArrowTooltip title={val} direction="top">
            <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
          </ArrowTooltip>
        </Box>
      );
    },
  },
  { field: "version", headerName: "Version", flex: 0.7, minWidth: 90 },
  { field: "lastSeen", headerName: "Last Seen", flex: 1, minWidth: 120 },
  {
    field: "policySchedule",
    headerName: "Policy/Schedule",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      const showMerge = params.value !== "Staging";
      const showGlobe =
        params.value !== "Development" && params.value !== "Staging";
      const hasBothIcons = showMerge && showGlobe;
      const hasNoIcons = !showMerge && !showGlobe;

      return (
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {hasNoIcons ? (
              <>
                <Box sx={{ width: 20, height: 20 }} />
                <Box sx={{ width: 20, height: 20 }} />
              </>
            ) : hasBothIcons ? (
              <>
                <ArrowTooltip title="Inherited from Site" direction="top">
                  <Box
                    component="span"
                    className="material-symbols-outlined"
                    sx={{ fontSize: 20, color: "text.secondary" }}
                  >
                    location_on
                  </Box>
                </ArrowTooltip>
                <ArrowTooltip title="Global Policy" direction="top">
                  <Box
                    component="span"
                    className="material-symbols-outlined"
                    sx={{ fontSize: 20, color: "text.secondary" }}
                  >
                    globe
                  </Box>
                </ArrowTooltip>
              </>
            ) : (
              <>
                <Box sx={{ width: 20, height: 20 }} />
                {showMerge && (
                  <ArrowTooltip title="Inherited from Site" direction="top">
                    <Box
                      component="span"
                      className="material-symbols-outlined"
                      sx={{ fontSize: 20, color: "text.secondary" }}
                    >
                      location_on
                    </Box>
                  </ArrowTooltip>
                )}
                {showGlobe && (
                  <ArrowTooltip title="Global Policy" direction="top">
                    <Box
                      component="span"
                      className="material-symbols-outlined"
                      sx={{ fontSize: 20, color: "text.secondary" }}
                    >
                      globe
                    </Box>
                  </ArrowTooltip>
                )}
              </>
            )}
          </Box>
          {params.value}
        </Box>
      );
    },
  },
  {
    field: "lastDeployed",
    headerName: "Last Deployed",
    flex: 1.2,
    minWidth: 150,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    sortable: false,
    filterable: false,
    resizable: false,
    renderCell: () => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton
          size="small"
          aria-label="edit"
          sx={{ color: "text.primary" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            edit
          </span>
        </IconButton>
        <IconButton
          size="small"
          aria-label="more options"
          sx={{ color: "text.primary" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            more_horiz
          </span>
        </IconButton>
      </Box>
    ),
  },
];

// ---------------------------------------------------------------------------
// Row data
// ---------------------------------------------------------------------------

const rows = [
  {
    id: 1,
    hostname: "DC-PC-JSMITH01",
    name: "Production API",
    status: "Active",
    agentOS: "Windows",
    version: "3.1.0",
    lastSeen: "< 15 minutes",
    policySchedule: "Production",
    lastDeployed: "2024-01-15 10:30",
  },
  {
    id: 2,
    hostname: "NYC-LT-ADOE02",
    name: "Staging API",
    status: "Active",
    agentOS: "macOS",
    version: "2.1.0",
    lastSeen: "> 90 days",
    policySchedule: "Staging",
    lastDeployed: "2024-01-14 15:45",
  },
  {
    id: 3,
    hostname: "CHI-WS-BCLARK03",
    name: "Dev Frontend",
    status: "Pending",
    agentOS: "iOS",
    version: "3.1.0",
    lastSeen: "< 7 days",
    policySchedule: "Development",
    lastDeployed: "2024-01-13 09:20",
  },
  {
    id: 4,
    hostname: "MIA-SRV-FILESVR01",
    name: "Auth Service",
    status: "Active",
    agentOS: "Android",
    version: "2.1.0",
    lastSeen: "< 15 minutes",
    policySchedule: "Production",
    lastDeployed: "2024-01-12 14:00",
  },
  { id: 5, hostname: "LA-PC-MLOPEZ04", name: "Worker Service", status: "Stopped", agentOS: "macOS", version: "3.1.0", lastSeen: "> 90 days", policySchedule: "Staging", lastDeployed: "2024-01-10 11:15" },
  { id: 6, hostname: "BOS-LT-KWILSON05", name: "Analytics", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 08:00" },
  { id: 7, hostname: "SEA-PC-TNGUYEN06", name: "Reporting", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Production", lastDeployed: "2024-01-15 14:20" },
  { id: 8, hostname: "ATL-WS-RJONES07", name: "Dev Backend", status: "Active", agentOS: "iOS", version: "2.1.0", lastSeen: "< 15 minutes", policySchedule: "Development", lastDeployed: "2024-01-14 09:10" },
  { id: 9, hostname: "PHX-LT-SCHEN08", name: "QA Testing", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 7 days", policySchedule: "Staging", lastDeployed: "2024-01-13 11:30" },
  { id: 10, hostname: "DEN-PC-MWILLIAMS09", name: "Production API", status: "Active", agentOS: "Android", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-15 16:45" },
  { id: 11, hostname: "MIN-WS-PLEE10", name: "Dev Frontend", status: "Pending", agentOS: "iOS", version: "2.1.0", lastSeen: "< 1 hour", policySchedule: "Development", lastDeployed: "2024-01-12 13:00" },
  { id: 12, hostname: "POR-LT-AHERNANDEZ11", name: "Worker Service", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 07:30" },
  { id: 13, hostname: "CLE-PC-DMARTIN12", name: "Auth Service", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Production", lastDeployed: "2024-01-15 10:00" },
  { id: 14, hostname: "STL-WS-ETHOMPSON13", name: "Staging API", status: "Stopped", agentOS: "Windows", version: "2.1.0", lastSeen: "> 90 days", policySchedule: "Staging", lastDeployed: "2024-01-08 15:00" },
  { id: 15, hostname: "SAN-LT-CGARCIA14", name: "Production API", status: "Active", agentOS: "Android", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 09:15" },
  { id: 16, hostname: "ORL-PC-JMARTINEZ15", name: "Analytics", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Production", lastDeployed: "2024-01-15 11:45" },
  { id: 17, hostname: "PIT-WS-BANDERSON16", name: "QA Testing", status: "Active", agentOS: "Windows", version: "2.1.0", lastSeen: "< 7 days", policySchedule: "Staging", lastDeployed: "2024-01-13 14:30" },
  { id: 18, hostname: "CIN-LT-LTAYLOR17", name: "Dev Backend", status: "Pending", agentOS: "iOS", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Development", lastDeployed: "2024-01-14 08:00" },
  { id: 19, hostname: "IND-PC-MMOORE18", name: "Worker Service", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 06:45" },
  { id: 20, hostname: "COL-WS-DJACKSON19", name: "Auth Service", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-15 17:00" },
  { id: 21, hostname: "MEM-LT-KWHITE20", name: "Reporting", status: "Stopped", agentOS: "Android", version: "2.1.0", lastSeen: "> 90 days", policySchedule: "Staging", lastDeployed: "2024-01-05 10:00" },
  { id: 22, hostname: "LOU-PC-SHARRIS21", name: "Production API", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 08:30" },
  { id: 23, hostname: "BAL-WS-RLEWIS22", name: "Dev Frontend", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Development", lastDeployed: "2024-01-14 12:15" },
  { id: 24, hostname: "MIL-LT-YROBINSON23", name: "Analytics", status: "Active", agentOS: "iOS", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-15 09:00" },
  { id: 25, hostname: "NAS-PC-CWALKER24", name: "Staging API", status: "Pending", agentOS: "Windows", version: "2.1.0", lastSeen: "< 7 days", policySchedule: "Staging", lastDeployed: "2024-01-13 16:00" },
  { id: 26, hostname: "OKC-WS-NHALL25", name: "Worker Service", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 07:00" },
  { id: 27, hostname: "RIC-LT-AALLEN26", name: "Auth Service", status: "Active", agentOS: "Android", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Production", lastDeployed: "2024-01-15 13:30" },
  { id: 28, hostname: "SAC-PC-JYOUNG27", name: "QA Testing", status: "Active", agentOS: "Windows", version: "2.1.0", lastSeen: "< 7 days", policySchedule: "Staging", lastDeployed: "2024-01-12 10:45" },
  { id: 29, hostname: "SLC-WS-MHERNANDEZ28", name: "Dev Backend", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Development", lastDeployed: "2024-01-14 15:00" },
  { id: 30, hostname: "TUC-LT-PKING29", name: "Production API", status: "Stopped", agentOS: "iOS", version: "2.1.0", lastSeen: "> 90 days", policySchedule: "Production", lastDeployed: "2024-01-02 09:00" },
  { id: 31, hostname: "FRE-PC-OWRIGHT30", name: "Reporting", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 10:00" },
  { id: 32, hostname: "MSP-WS-TLOPEZ31", name: "Analytics", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Production", lastDeployed: "2024-01-15 08:30" },
  { id: 33, hostname: "KCM-LT-EHILL32", name: "Worker Service", status: "Active", agentOS: "Android", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 06:00" },
  { id: 34, hostname: "JAX-PC-GSCOTT33", name: "Staging API", status: "Active", agentOS: "Windows", version: "2.1.0", lastSeen: "< 7 days", policySchedule: "Staging", lastDeployed: "2024-01-13 13:15" },
  { id: 35, hostname: "AUS-WS-HGREEN34", name: "Auth Service", status: "Pending", agentOS: "macOS", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Production", lastDeployed: "2024-01-15 12:00" },
  { id: 36, hostname: "LVG-LT-JADAMS35", name: "Dev Frontend", status: "Active", agentOS: "iOS", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Development", lastDeployed: "2024-01-14 11:00" },
  { id: 37, hostname: "HOU-PC-NBAKER36", name: "Production API", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 09:45" },
  { id: 38, hostname: "SJC-WS-RGORDON37", name: "QA Testing", status: "Stopped", agentOS: "macOS", version: "2.1.0", lastSeen: "> 90 days", policySchedule: "Staging", lastDeployed: "2024-01-03 14:00" },
  { id: 39, hostname: "BUF-LT-MREYES38", name: "Worker Service", status: "Active", agentOS: "Android", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 08:15" },
  { id: 40, hostname: "ELP-PC-DMORALES39", name: "Dev Backend", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Development", lastDeployed: "2024-01-14 16:30" },
  { id: 41, hostname: "ABQ-WS-SCARTER40", name: "Analytics", status: "Active", agentOS: "macOS", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-15 07:45" },
  { id: 42, hostname: "TPA-LT-OMITCHELL41", name: "Reporting", status: "Active", agentOS: "iOS", version: "3.1.0", lastSeen: "< 1 hour", policySchedule: "Production", lastDeployed: "2024-01-15 15:00" },
  { id: 43, hostname: "RDU-PC-CPEREZ42", name: "Auth Service", status: "Active", agentOS: "Windows", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 10:30" },
  { id: 44, hostname: "GRR-WS-LROBERTS43", name: "Staging API", status: "Pending", agentOS: "macOS", version: "2.1.0", lastSeen: "< 7 days", policySchedule: "Staging", lastDeployed: "2024-01-12 09:30" },
  { id: 45, hostname: "ONT-LT-ATURNER44", name: "Production API", status: "Active", agentOS: "Android", version: "3.1.0", lastSeen: "< 15 minutes", policySchedule: "Production", lastDeployed: "2024-01-16 07:15" },
];

// ---------------------------------------------------------------------------
// Status tab configuration
// ---------------------------------------------------------------------------

const tabsConfig: StatusTabConfig[] = [
  {
    icon: "devices",
    count: rows.length,
    label: "All",
    color: "primary.main",
    iconColorVar: "var(--dnsf-palette-primary-main)",
    progressValue: 100,
  },
  {
    icon: "verified_user",
    count: 5,
    label: "Protected",
    color: "success.main",
    iconColorVar: "var(--dnsf-palette-success-main)",
    progressValue: 100,
    showInfoIcon: true,
    infoTooltip: (
      <>
        Roaming Clients are synced with DNSFilter and have a policy assigned.{" "}
        <strong>Environment configurations</strong> can prevent the agent from
        filtering. Monitor Last Sync for conflict indicators.
      </>
    ),
  },
  {
    icon: "remove_moderator",
    count: 0,
    label: "Unprotected",
    color: "primary.main",
    iconColorVar: "var(--dnsf-palette-warning-main)",
    progressValue: 0,
    showInfoIcon: true,
    infoTooltip:
      "Roaming Clients are synced with DNSFilter but do not have a policy assigned. The agent cannot enforce filtering and the device is not protected.",
  },
  {
    icon: "wifi_tethering_off",
    count: 0,
    label: "Offline",
    color: "primary.main",
    iconColorVar: "var(--dnsf-palette-text-primary)",
    progressValue: 0,
    showInfoIcon: true,
    infoTooltip: (
      <>
        Roaming Clients are not synced with DNSFilter. This can occur if the
        device is powered off, the agent is uninstalled or cannot sync. Use the{" "}
        <strong>Clean Up Tool</strong> to delete offline agents.
      </>
    ),
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function RoamingClientsPage() {
  const [cardTab, setCardTab] = useState(0);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              install_desktop
            </span>
          }
        >
          Install Roaming Client
        </Button>
      </Box>
      <TabbedDataCard
        tabs={tabsConfig}
        activeTab={cardTab}
        onTabChange={(_, newValue) => setCardTab(newValue)}
      >
        {cardTab === 0 && (
          <DataTable
            rows={rows}
            columns={columns}
            pinnedShadowFields={{ left: "hostname", right: "actions" }}
          />
        )}
        {cardTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography>Tab 2 Content</Typography>
          </Box>
        )}
        {cardTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography>Tab 3 Content</Typography>
          </Box>
        )}
      </TabbedDataCard>
    </>
  );
}
