import { Button, IconButton, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import type { GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { AndroidIcon } from "@/components/icons/os-icons";
import type { StatusTabConfig } from "@/components/tabbed-data-card";
import { TabbedDataCard } from "@/components/tabbed-data-card";
import { roamingClientRows } from "@/data/roaming-clients";

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: "100%",
        }}
      >
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
// Status tab configuration
// ---------------------------------------------------------------------------

const tabsConfig: StatusTabConfig[] = [
  {
    icon: "devices",
    count: roamingClientRows.length,
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
            rows={roamingClientRows}
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
