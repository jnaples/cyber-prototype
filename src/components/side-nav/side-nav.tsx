import { Box, Collapse } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { useNavigate } from "react-router";

import { Logo, LogoCollapsed } from "@/components/logo";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { brandConfig } from "@/theme/brand-config";

// Material Symbol icon component
function Icon({
  name,
  size = 20,
  color,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

// Constants for consistent sizing
const DRAWER_WIDTH_EXPANDED = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

const DrawerContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isExpanded",
})<{ isExpanded: boolean }>(({ theme, isExpanded }) => ({
  width: isExpanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED,
  flexShrink: 0,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  "& .MuiDrawer-paper": {
    width: isExpanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED,
    boxSizing: "border-box",
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "none",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
    overflowX: "hidden",
  },
}));

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>("dashboard-overview");
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const handleDropdownToggle = (dropdownId: string) => {
    if (isExpanded) {
      setExpandedDropdown(expandedDropdown === dropdownId ? null : dropdownId);
    }
  };

  const getItemStyles = (itemId: string, isDropdownOpen?: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: isExpanded ? "flex-start" : "center",
    gap: 1,
    py: "2px",
    px: isExpanded ? 1 : 0,
    width: "100%",
    lineHeight: "24px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    backgroundColor:
      activeItem === itemId
        ? (theme: Theme) => theme.palette.primary.main
        : isDropdownOpen || activeItem.startsWith(itemId + "-")
          ? brandConfig.palette.grey["800"]
          : "transparent",
    "& > svg": {
      fontSize: isExpanded ? "1.2rem" : "1.5rem",
      padding: isExpanded ? 0 : "5px",
      width: isExpanded ? 18 : 24,
      height: isExpanded ? 18 : 24,
      color: "inherit",
    },
    // Some icons have small artwork inside their viewBox; scale inner paths when collapsed
    "& > svg path, & > svg g, & > svg circle": {
      transformBox: "fill-box",
      transformOrigin: "center",
      transform: isExpanded ? "none" : "scale(1.18)",
    },
    "&:hover": {
      backgroundColor:
        activeItem === itemId
          ? (theme: Theme) => theme.palette.primary.main
          : isDropdownOpen || activeItem.startsWith(itemId + "-")
            ? brandConfig.palette.grey["800"]
            : "rgba(255, 255, 255, 0.1)",
    },
  });

  const getDropdownWrapperStyles = (dropdownId: string) => ({
    backgroundColor:
      activeItem.startsWith(dropdownId + "-") || expandedDropdown === dropdownId
        ? brandConfig.palette.grey["900"]
        : "transparent",
    borderRadius: "6px",
    transition: "background-color 0.2s",
  });

  const getSubItemStyles = (itemId: string) => ({
    display: "flex",
    alignItems: "center",
    gap: 2,
    lineHeight: "24px",
    py: "2px",
    px: 1,
    ml: 3,
    borderRadius: 1,
    cursor: "pointer",
    transition: "background-color 0.2s",
    backgroundColor:
      activeItem === itemId
        ? (theme: Theme) => theme.palette.primary.main
        : "transparent",
    "&:hover": {
      backgroundColor: activeItem === itemId ? "#333333" : "rgb(66, 66, 66);",
    },
  });

  return (
    <DrawerContainer isExpanded={isExpanded}>
      <Box
        sx={{
          height: "100%",
          width: isExpanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED,
          backgroundColor: "#000000",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          zIndex: 1200,
          transition: (theme: Theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          style={{
            background: "black",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "6px",
            position: "fixed",
            top: "16px",
            left: isExpanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED, // Adjust '40' as needed for button width/padding
            transform: "translateX(-50%)", // Center the button based on its own width
          }}
        >
          {isExpanded ? (
            <Icon name="chevron_left" size={20} />
          ) : (
            <Icon name="chevron_right" size={20} />
          )}
        </button>

        {/* Logo Section - pinned top */}
        <Box sx={{ py: 1, px: 2 }}>
          {isExpanded ? (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Logo />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ThemeModeToggle inline />
                <button
                  style={{
                    padding: "5px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Icon name="notifications" size={24} color="#fff" />
                </button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <LogoCollapsed />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <button
                  style={{
                    padding: "5px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Icon name="notifications" size={24} color="#fff" />
                </button>
                <ThemeModeToggle inline />
              </Box>
            </Box>
          )}
        </Box>

        {/* Navigation Links - scrollable middle */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            py: 1,
            px: 1,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          <Box
            sx={getItemStyles("overview")}
            onClick={() => {
              handleItemClick("overview");
              navigate("/overview");
            }}
          >
            <Icon name="language" />
            {isExpanded && <span style={{ margin: "4px 0" }}>Overview</span>}
          </Box>

          {/* Policies Links */}
          <Box sx={getDropdownWrapperStyles("policies")}>
            <Box
              sx={getItemStyles("policies", expandedDropdown === "policies")}
              onClick={() => handleDropdownToggle("policies")}
            >
              {isExpanded && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Container for the LibraryBooksOutlined icon and Policies span */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon name="menu_book" />
                      <Box sx={{ my: 0.5, ml: 1 }}>
                        {" "}
                        {/* Added ml for some spacing */}
                        <span>Policies</span>
                      </Box>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transform:
                          expandedDropdown === "policies"
                            ? "rotate(0deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      {expandedDropdown === "policies" ? (
                        <Icon name="expand_less" />
                      ) : (
                        <Icon name="expand_more" />
                      )}
                    </div>
                  </div>
                </>
              )}
              {!isExpanded && <Icon name="menu_book" />}
            </Box>
            {/* Policies Dropdown Items */}
            <Collapse in={expandedDropdown === "policies" && isExpanded}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  borderRadius: "0 0 6px 6px",
                }}
              >
                <Box
                  sx={getSubItemStyles("policies-filtering")}
                  onClick={() => handleItemClick("policies-filtering")}
                >
                  <span style={{ margin: "4px 0" }}>Filtering</span>
                </Box>
                <Box
                  sx={getSubItemStyles("policies-filtering-schedules")}
                  onClick={() =>
                    handleItemClick("policies-filtering-schedules")
                  }
                >
                  <span style={{ margin: "4px 0" }}>Filtering Schedules</span>
                </Box>
                <Box
                  sx={getSubItemStyles("policies-block-pages")}
                  onClick={() => handleItemClick("policies-block-pages")}
                >
                  <span style={{ margin: "4px 0" }}>Block Pages</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Deployments Link with Dropdown */}
          <Box sx={getDropdownWrapperStyles("deployments")}>
            <Box
              sx={getItemStyles(
                "deployments",
                expandedDropdown === "deployments",
              )}
              onClick={() => handleDropdownToggle("deployments")}
            >
              {isExpanded && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Container for the DeviceHubOutlinedIcon and Deployments span */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon name="device_hub" />
                      <span style={{ margin: "4px 0 4px 8px" }}>
                        Deployments
                      </span>{" "}
                      {/* Added left margin */}
                    </div>

                    {/* Expand/Collapse Icon */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transform:
                          expandedDropdown === "deployments"
                            ? "rotate(0deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      {expandedDropdown === "deployments" ? (
                        <Icon name="expand_less" />
                      ) : (
                        <Icon name="expand_more" />
                      )}
                    </Box>
                  </div>
                </>
              )}
              {!isExpanded && <Icon name="device_hub" />}
            </Box>

            {/* Analytics Dropdown Items */}
            <Collapse in={expandedDropdown === "deployments" && isExpanded}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  borderRadius: "0 0 6px 6px",
                }}
              >
                <Box
                  sx={getSubItemStyles("deployments-sites")}
                  onClick={() => {
                    handleItemClick("deployments-sites");
                    navigate("/deployments/sites");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Sites</span>
                </Box>
                <Box
                  sx={getSubItemStyles("deployments-roaming-clients")}
                  onClick={() => {
                    handleItemClick("deployments-roaming-clients");
                    navigate("/deployments/roaming-clients");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Roaming Clients</span>
                </Box>
                <Box
                  sx={getSubItemStyles("deployments-relays")}
                  onClick={() => handleItemClick("deployments-relays")}
                >
                  <span style={{ margin: "4px 0" }}>Relays</span>
                </Box>
                <Box
                  sx={getSubItemStyles("deployments-collections")}
                  onClick={() => handleItemClick("deployments-collections")}
                >
                  <span style={{ margin: "4px 0" }}>Collections</span>
                </Box>
                <Box
                  sx={getSubItemStyles("deployments-users")}
                  onClick={() => handleItemClick("deployments-users")}
                >
                  <span style={{ margin: "4px 0" }}>Users</span>
                </Box>
                <Box
                  sx={getSubItemStyles("deployments-sync-tools")}
                  onClick={() => handleItemClick("deployments-sync-tools")}
                >
                  <span style={{ margin: "4px 0" }}>Sync Tools</span>
                </Box>
                <Box
                  sx={getSubItemStyles("deployments-local-domains")}
                  onClick={() => handleItemClick("deployments-local-domains")}
                >
                  <span style={{ margin: "4px 0" }}>Local Domains</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* CyberSight Link with Dropdown */}
          <Box sx={getDropdownWrapperStyles("cybersight")}>
            <Box
              sx={getItemStyles(
                "cybersight",
                expandedDropdown === "cybersight",
              )}
              onClick={() => handleDropdownToggle("cybersight")}
            >
              {isExpanded && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon name="insights" />
                      <span style={{ margin: "4px 0 4px 8px" }}>
                        CyberSight
                      </span>
                    </div>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transform:
                          expandedDropdown === "cybersight"
                            ? "rotate(0deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      {expandedDropdown === "cybersight" ? (
                        <Icon name="expand_less" />
                      ) : (
                        <Icon name="expand_more" />
                      )}
                    </Box>
                  </div>
                </>
              )}
              {!isExpanded && <Icon name="insights" />}
            </Box>

            <Collapse in={expandedDropdown === "cybersight" && isExpanded}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  borderRadius: "0 0 6px 6px",
                }}
              >
                <Box
                  sx={getSubItemStyles("cybersight-activity-overview")}
                  onClick={() => {
                    handleItemClick("cybersight-activity-overview");
                    navigate("/cybersight");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Activity Overview</span>
                </Box>
                <Box
                  sx={getSubItemStyles("cybersight-activity-logs")}
                  onClick={() => handleItemClick("cybersight-activity-logs")}
                >
                  <span style={{ margin: "4px 0" }}>Activity Logs</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Reporting Link with Dropdown */}
          <Box sx={getDropdownWrapperStyles("reporting")}>
            <Box
              sx={getItemStyles("reporting", expandedDropdown === "reporting")}
              onClick={() => handleDropdownToggle("reporting")}
            >
              {isExpanded && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Container for the BarChartOutlined icon and Reporting span */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon name="bar_chart" />
                      <span style={{ margin: "4px 0 4px 8px" }}>
                        Reporting
                      </span>{" "}
                      {/* Added left margin */}
                    </div>

                    {/* Expand/Collapse Icon */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transform:
                          expandedDropdown === "reporting"
                            ? "rotate(0deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      {expandedDropdown === "reporting" ? (
                        <Icon name="expand_less" />
                      ) : (
                        <Icon name="expand_more" />
                      )}
                    </Box>
                  </div>
                </>
              )}
              {!isExpanded && <Icon name="bar_chart" />}
            </Box>
            {/* Analytics Dropdown Items */}
            <Collapse in={expandedDropdown === "reporting" && isExpanded}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  borderRadius: "0 0 6px 6px",
                }}
              >
                <Box
                  sx={getSubItemStyles("reporting-insights")}
                  onClick={() => handleItemClick("reporting-insights")}
                >
                  <span style={{ margin: "4px 0" }}>Insights</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-appaware")}
                  onClick={() => handleItemClick("reporting-appaware")}
                >
                  <span style={{ margin: "4px 0" }}>Appaware</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-dns-query-log")}
                  onClick={() => {
                    handleItemClick("reporting-dns-query-log");
                    navigate("/query-logs");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>DNS Query Log</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-scheduled-reports")}
                  onClick={() => handleItemClick("reporting-scheduled-reports")}
                >
                  <span style={{ margin: "4px 0" }}>Scheduled Reports</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-data-explorer")}
                  onClick={() => handleItemClick("reporting-data-explorer")}
                >
                  <span style={{ margin: "4px 0" }}>Data Explorer</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-total-requests")}
                  onClick={() => handleItemClick("reporting-total-requests")}
                >
                  <span style={{ margin: "4px 0" }}>Total Requests</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-queries-per-second")}
                  onClick={() =>
                    handleItemClick("reporting-queries-per-second")
                  }
                >
                  <span style={{ margin: "4px 0" }}>Queries Per Second</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-most-active-sites")}
                  onClick={() => handleItemClick("reporting-most-active-sites")}
                >
                  <span style={{ margin: "4px 0" }}>Most Active Sites</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-top-requests")}
                  onClick={() => handleItemClick("reporting-top-requests")}
                >
                  <span style={{ margin: "4px 0" }}>Top Requests</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-threats")}
                  onClick={() => handleItemClick("reporting-threats")}
                >
                  <span style={{ margin: "4px 0" }}>Threats</span>
                </Box>
                <Box
                  sx={getSubItemStyles("reporting-alerts")}
                  onClick={() => handleItemClick("reporting-alerts")}
                >
                  <span style={{ margin: "4px 0" }}>Alerts</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Organization Link */}
          <Box sx={getDropdownWrapperStyles("organization")}>
            <Box
              sx={getItemStyles(
                "organization",
                expandedDropdown === "organization",
              )}
              onClick={() => handleDropdownToggle("organization")}
            >
              {isExpanded && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Container for the BusinessOutlined icon and Organization span */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon name="business" />
                      <span style={{ margin: "4px 0 4px 8px" }}>
                        Organization
                      </span>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transform:
                          expandedDropdown === "organization"
                            ? "rotate(0deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      {expandedDropdown === "organization" ? (
                        <Icon name="expand_less" />
                      ) : (
                        <Icon name="expand_more" />
                      )}
                    </Box>
                  </div>
                </>
              )}
              {!isExpanded && <Icon name="business" />}
            </Box>
            {/* Analytics Dropdown Items */}
            <Collapse in={expandedDropdown === "organization" && isExpanded}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  borderRadius: "0 0 6px 6px",
                }}
              >
                <Box
                  sx={getSubItemStyles("organization-profile")}
                  onClick={() => handleItemClick("organization-profile")}
                >
                  <span style={{ margin: "4px 0" }}>Profile</span>
                </Box>
                <Box
                  sx={getSubItemStyles("organization-users")}
                  onClick={() => handleItemClick("organization-users")}
                >
                  <span style={{ margin: "4px 0" }}>Users</span>
                </Box>
                <Box
                  sx={getSubItemStyles("organization-billing")}
                  onClick={() => handleItemClick("organization-billing")}
                >
                  <span style={{ margin: "4px 0" }}>Billing</span>
                </Box>
                <Box
                  sx={getSubItemStyles("organization-subscriptions")}
                  onClick={() => {
                    handleItemClick("organization-subscriptions");
                    navigate("/subscriptions");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Subscriptions</span>
                </Box>
                <Box
                  sx={getSubItemStyles("organization-settings")}
                  onClick={() => handleItemClick("organization-settings")}
                >
                  <span style={{ margin: "4px 0" }}>Settings</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Tools Link */}
          <Box sx={getDropdownWrapperStyles("tools")}>
            <Box
              sx={getItemStyles("tools", expandedDropdown === "tools")}
              onClick={() => handleDropdownToggle("tools")}
            >
              {isExpanded && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Container for the BuildOutlined icon and Tools span */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon name="build" />
                      <span style={{ margin: "4px 0 4px 8px" }}>Tools</span>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transform:
                          expandedDropdown === "tools"
                            ? "rotate(0deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      {expandedDropdown === "tools" ? (
                        <Icon name="expand_less" />
                      ) : (
                        <Icon name="expand_more" />
                      )}
                    </Box>
                  </div>
                </>
              )}
              {!isExpanded && <Icon name="build" />}
            </Box>
            {/* Analytics Dropdown Items */}
            <Collapse in={expandedDropdown === "tools" && isExpanded}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  borderRadius: "0 0 6px 6px",
                }}
              >
                <Box
                  sx={getSubItemStyles("tools-dns-query-log")}
                  onClick={() => {
                    handleItemClick("tools-dns-query-log");
                    navigate("/query-logs");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>DNS Query Log</span>
                </Box>
                <Box
                  sx={getSubItemStyles("tools-data-exports")}
                  onClick={() => handleItemClick("tools-data-exports")}
                >
                  <span style={{ margin: "4px 0" }}>Data Export</span>
                </Box>
                <Box
                  sx={getSubItemStyles("tools-policy-audit-log")}
                  onClick={() => handleItemClick("tools-policy-audit-log")}
                >
                  <span style={{ margin: "4px 0" }}>Policy Audit Log</span>
                </Box>
                <Box
                  sx={getSubItemStyles("tools-debug-page")}
                  onClick={() => handleItemClick("tools-debug-page")}
                >
                  <span style={{ margin: "4px 0" }}>Debug Page</span>
                </Box>
                <Box
                  sx={getSubItemStyles("tools-ssl-certificate")}
                  onClick={() => handleItemClick("tools-ssl-certificate")}
                >
                  <span style={{ margin: "4px 0" }}>SSL Certificate</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Integrations Link */}
          <Box
            sx={getItemStyles("integrations")}
            onClick={() => handleItemClick("integrations")}
          >
            <Icon name="integration_instructions" />
            {isExpanded && (
              <span style={{ margin: "4px 0" }}>Integrations</span>
            )}
          </Box>
        </Box>
        {/* Second Nav Links - pinned bottom */}
        <Box>
          <Box
            sx={{
              borderTop: "solid  rgb(66, 66, 66)",
              borderBottom: "solid  rgb(66, 66, 66)",
              borderWidth: "thin 0px",
              py: 1,
              px: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {/* Account Link */}
            <Box sx={getDropdownWrapperStyles("account")}>
              <Box
                sx={getItemStyles("account", expandedDropdown === "account")}
                onClick={() => handleDropdownToggle("account")}
              >
                {isExpanded && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Container for the JN Box and Account span */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            backgroundColor: (theme: Theme) =>
                              theme.palette.primary.main,
                            borderRadius: "4px",
                            width: "24px",
                            height: "24px",
                            fontSize: "12px",
                            textAlign: "center",
                            lineHeight: "24px", // Vertically center "JN"
                            color: "white", // Make "JN" text visible
                          }}
                        >
                          DJ
                        </Box>
                        <span style={{ margin: "4px 0 4px 8px" }}>Account</span>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          transform:
                            expandedDropdown === "account" // Changed from "tools" to "account"
                              ? "rotate(0deg)"
                              : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        {expandedDropdown === "account" ? ( // Changed from "tools" to "account"
                          <Icon name="expand_less" />
                        ) : (
                          <Icon name="expand_more" />
                        )}
                      </Box>
                    </div>
                  </>
                )}
                {/* Display "JN" box when not expanded (optional, depending on desired behavior) */}
                {!isExpanded && (
                  <Box
                    sx={{
                      backgroundColor: (theme: Theme) =>
                        theme.palette.primary.main,
                      borderRadius: "4px",
                      width: "24px",
                      height: "24px",
                      fontSize: "12px",
                      textAlign: "center",
                      lineHeight: "24px",
                      color: "white",
                    }}
                  >
                    DJ
                  </Box>
                )}
              </Box>
              {/* Account Dropdown Items */}
              <Collapse in={expandedDropdown === "account" && isExpanded}>
                <Box
                  sx={{
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    backgroundColor: brandConfig.palette.grey["900"],
                    borderRadius: "0 0 6px 6px",
                  }}
                >
                  <Box
                    sx={getSubItemStyles("account-settings")}
                    onClick={() => handleItemClick("account-settings")}
                  >
                    <span style={{ margin: "4px 0" }}>Account Settings</span>
                  </Box>
                  <Box
                    sx={getSubItemStyles("account-logout")}
                    onClick={() => handleItemClick("tools-logout")}
                  >
                    <span style={{ margin: "4px 0" }}>Logout</span>
                  </Box>
                </Box>
              </Collapse>
            </Box>
            {/* Domain Report Link */}
            <Box
              sx={getItemStyles("domain-report")}
              onClick={() => handleItemClick("domain-report")}
            >
              <Icon name="integration_instructions" />
              {isExpanded && (
                <span style={{ margin: "4px 0" }}>Domain Report</span>
              )}
            </Box>
          </Box>
          <Box sx={{ padding: "8px 2px" }}>
            {isExpanded && (
              <Box
                sx={{
                  padding: "4px 0 4px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: 14 }}>System Status</span>
                <Icon name="check_circle" size={20} color="rgb(30, 241, 162)" />
                <span style={{ fontSize: 14 }}>Operational</span>
              </Box>
            )}
            {!isExpanded && (
              <Icon name="check_circle" size={20} color="rgb(30, 241, 162)" />
            )}
          </Box>
        </Box>
      </Box>
    </DrawerContainer>
  );
}
