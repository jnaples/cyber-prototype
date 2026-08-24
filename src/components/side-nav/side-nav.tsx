import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import { Badge, Box, Collapse, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { Logo, LogoCollapsed } from "@/components/logo";
import { MspBadge } from "@/components/msp-badge";
import { useWorkspace } from "@/hooks/use-workspace";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { lightPalette } from "@/theme/core/palette";

import { MaterialSymbol } from "../material-symbol";
import { OrgSwitcher } from "./org-switcher";

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
    <MaterialSymbol
      name={name}
      size={size}
      sx={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        ...style,
      }}
    />
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
  // A client organization is scoped to one company, so the labels drop the
  // MSP-wide framing: "Global Policies" is just "Policies", "MSP" is the
  // organization itself.
  const { name: workspace, isOrganization, select } = useWorkspace();
  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const withCollapsedTooltip = (label: string, node: React.ReactElement) =>
    isExpanded ? (
      node
    ) : (
      <ArrowTooltip title={label} direction="right">
        {node}
      </ArrowTooltip>
    );

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
          ? lightPalette.grey[800]
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
            ? lightPalette.grey[800]
            : "rgba(255, 255, 255, 0.1)",
    },
  });

  // Group heading, so the rail can be scanned rather than read top to bottom.
  // Collapsed it renders nothing at all, so the icons sit evenly spaced with no
  // gap where a heading used to be.
  const sectionLabel = (text: string) =>
    isExpanded ? (
      <Typography
        component="div"
        variant="overline"
        sx={{
          px: 1,
          mt: 2,
          mb: 0,
          lineHeight: 1.4,
          // The rail is always dark, whatever the app theme.
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        {text}
      </Typography>
    ) : null;

  const getDropdownWrapperStyles = (dropdownId: string) => ({
    backgroundColor:
      activeItem.startsWith(dropdownId + "-") || expandedDropdown === dropdownId
        ? lightPalette.grey[900]
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
        <Box sx={{ py: 1, px: isExpanded ? 2 : 1 }}>
          {isExpanded ? (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <MspBadge>
                <Logo />
              </MspBadge>

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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Nudged in from the rail edge so the MSP badge isn't clipped
                  and the collapse chevron doesn't sit on the mark. */}
              <MspBadge sx={{ mt: 1, mr: 1.5 }}>
                <LogoCollapsed />
              </MspBadge>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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

        {/* Workspace / organization switcher */}
        {isExpanded && <OrgSwitcher selected={workspace} onSelect={select} />}

        {/* Navigation Links - scrollable middle.
            Toggling the rail changes what's in the list (the group headings come
            and go), so the items would visibly jump to new positions mid-slide.
            Keying on the state remounts the list, replaying the animation below:
            the items hold at zero opacity while the rail resizes, then fade in
            already in place. */}
        <Box
          key={isExpanded ? "expanded" : "collapsed"}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            py: 1,
            px: 1,
            overflowY: "auto",
            minHeight: 0,
            animation: "navSettle 320ms ease both",
            "@keyframes navSettle": {
              "0%, 45%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        >
          {/* Overview is hidden from the nav for now — /overview still routes,
              so this block can come back as-is when it's wanted again. */}

          {/* Dashboards Link */}
          {withCollapsedTooltip(
            "Dashboards",
            <Box
              sx={getItemStyles("dashboards")}
              onClick={() => {
                handleItemClick("dashboards");
                navigate("/dashboards");
              }}
            >
              <Icon name="dashboard" size={isExpanded ? 20 : 24} />
              {isExpanded && (
                <span style={{ margin: "4px 0" }}>Dashboards</span>
              )}
            </Box>,
          )}

          {sectionLabel("Protect")}

          {/* Global Policies — a single destination; the page's own tabs cover
              Filtering / Filtering Schedules / Block Pages. */}
          {withCollapsedTooltip(
            isOrganization ? "Policies" : "Global Policies",
            <Box
              sx={getItemStyles("policies")}
              onClick={() => {
                handleItemClick("policies");
                navigate("/global-policies");
              }}
            >
              <LibraryBooksOutlinedIcon
                sx={{ fontSize: isExpanded ? 20 : 24 }}
              />
              {isExpanded && (
                <span style={{ margin: "4px 0" }}>
                  {isOrganization ? "Policies" : "Global Policies"}
                </span>
              )}
            </Box>,
          )}

          {/* Unblock Requests — its own destination rather than a policy child. */}
          {withCollapsedTooltip(
            "Unblock Requests",
            <Box
              sx={{ ...getItemStyles("unblock-requests"), gap: 0 }}
              onClick={() => {
                handleItemClick("unblock-requests");
                navigate("/unblock-requests");
              }}
            >
              <FactCheckOutlinedIcon sx={{ fontSize: isExpanded ? 20 : 24 }} />
              {isExpanded && (
                <>
                  <span style={{ margin: "4px 0 4px 8px" }}>
                    Unblock Requests
                  </span>
                  <Badge
                    badgeContent={10}
                    sx={{
                      mx: 1,
                      "& .MuiBadge-badge": {
                        position: "static",
                        transform: "none",
                        bgcolor: "tertiary.main",
                        color: "tertiary.contrastText",
                      },
                    }}
                  />
                </>
              )}
            </Box>,
          )}

          {/* Deployments Link with Dropdown */}
          <Box sx={getDropdownWrapperStyles("deployments")}>
            {withCollapsedTooltip(
              "Deployments",
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
                {!isExpanded && <Icon name="device_hub" size={24} />}
              </Box>,
            )}

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
                  sx={getSubItemStyles("deployments-clientless")}
                  onClick={() => {
                    handleItemClick("deployments-clientless");
                    navigate("/deployments/clientless");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Clientless</span>
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

          {/* Identities Link with Dropdown */}
          <Box sx={getDropdownWrapperStyles("identities")}>
            {withCollapsedTooltip(
              "Identities",
              <Box
                sx={getItemStyles(
                  "identities",
                  expandedDropdown === "identities",
                )}
                onClick={() => handleDropdownToggle("identities")}
              >
                {isExpanded ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon name="person_check" />
                      <span style={{ margin: "4px 0 4px 8px" }}>
                        Identities
                      </span>
                    </div>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "transform 0.2s",
                      }}
                    >
                      {expandedDropdown === "identities" ? (
                        <Icon name="expand_less" />
                      ) : (
                        <Icon name="expand_more" />
                      )}
                    </Box>
                  </div>
                ) : (
                  <Icon name="person_check" size={24} />
                )}
              </Box>,
            )}

            <Collapse in={expandedDropdown === "identities" && isExpanded}>
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
                  sx={getSubItemStyles("identities-users")}
                  onClick={() => handleItemClick("identities-users")}
                >
                  <span style={{ margin: "4px 0" }}>Users</span>
                </Box>
                <Box
                  sx={getSubItemStyles("identities-collections")}
                  onClick={() => handleItemClick("identities-collections")}
                >
                  <span style={{ margin: "4px 0" }}>Collections</span>
                </Box>
                <Box
                  sx={getSubItemStyles("identities-connections")}
                  onClick={() => handleItemClick("identities-connections")}
                >
                  <span style={{ margin: "4px 0" }}>Identity Connections</span>
                </Box>
                <Box
                  sx={getSubItemStyles("identities-ad-sync-tools")}
                  onClick={() => handleItemClick("identities-ad-sync-tools")}
                >
                  <span style={{ margin: "4px 0" }}>AD Sync Tools</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* SecureShield Link */}
          {withCollapsedTooltip(
            "SecureShield",
            <Box
              sx={getItemStyles("secureshield")}
              onClick={() => {
                handleItemClick("secureshield");
                navigate("/secureshield");
              }}
            >
              <Icon name="shield" size={isExpanded ? 20 : 24} />
              {isExpanded && (
                <>
                  <span style={{ margin: "4px 0" }}>SecureShield</span>
                  <Badge
                    badgeContent="NEW"
                    sx={{
                      mx: 1,
                      "& .MuiBadge-badge": {
                        position: "static",
                        transform: "none",
                        bgcolor: "tertiary.main",
                        color: "tertiary.contrastText",
                      },
                    }}
                  />
                </>
              )}
            </Box>,
          )}

          {sectionLabel("Monitor")}

          {/* DNS Query Log Link */}
          {withCollapsedTooltip(
            "DNS Query Log",
            <Box
              sx={getItemStyles("dns-query-log")}
              onClick={() => {
                handleItemClick("dns-query-log");
                navigate("/query-logs");
              }}
            >
              <Icon name="format_list_bulleted" size={isExpanded ? 20 : 24} />
              {isExpanded && (
                <span style={{ margin: "4px 0" }}>DNS Query Log</span>
              )}
            </Box>,
          )}

          {/* CyberSight Link — a single destination; the page's own tabs cover
              Activity Overview / Activity Timeline / User Threat Activity /
              Activity Logs. */}
          {withCollapsedTooltip(
            "CyberSight",
            <Box
              sx={getItemStyles("cybersight")}
              onClick={() => {
                handleItemClick("cybersight");
                navigate("/cybersight");
              }}
            >
              <Icon name="insights" size={isExpanded ? 20 : 24} />
              {isExpanded && (
                <span style={{ margin: "4px 0" }}>CyberSight</span>
              )}
            </Box>,
          )}

          {/* Analytics Link with Dropdown */}
          <Box sx={getDropdownWrapperStyles("analytics")}>
            {withCollapsedTooltip(
              "Analytics",
              <Box
                sx={getItemStyles(
                  "analytics",
                  expandedDropdown === "analytics",
                )}
                onClick={() => handleDropdownToggle("analytics")}
              >
                {isExpanded && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Icon name="bar_chart" />
                      <span style={{ margin: "4px 0 4px 8px" }}>Analytics</span>
                    </div>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {expandedDropdown === "analytics" ? (
                        <Icon name="expand_less" />
                      ) : (
                        <Icon name="expand_more" />
                      )}
                    </Box>
                  </div>
                )}
                {!isExpanded && <Icon name="bar_chart" size={24} />}
              </Box>,
            )}
            <Collapse in={expandedDropdown === "analytics" && isExpanded}>
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
                  sx={getSubItemStyles("analytics-insights")}
                  onClick={() => handleItemClick("analytics-insights")}
                >
                  <span style={{ margin: "4px 0" }}>Insights</span>
                </Box>
                <Box
                  sx={getSubItemStyles("analytics-appaware")}
                  onClick={() => handleItemClick("analytics-appaware")}
                >
                  <span style={{ margin: "4px 0" }}>AppAware</span>
                </Box>
                <Box
                  sx={getSubItemStyles("analytics-data-explorer")}
                  onClick={() => handleItemClick("analytics-data-explorer")}
                >
                  <span style={{ margin: "4px 0" }}>Data Explorer</span>
                </Box>
                <Box
                  sx={getSubItemStyles("analytics-total-requests")}
                  onClick={() => handleItemClick("analytics-total-requests")}
                >
                  <span style={{ margin: "4px 0" }}>Total Requests</span>
                </Box>
                <Box
                  sx={getSubItemStyles("analytics-queries-per-second")}
                  onClick={() =>
                    handleItemClick("analytics-queries-per-second")
                  }
                >
                  <span style={{ margin: "4px 0" }}>Queries Per Second</span>
                </Box>
                <Box
                  sx={getSubItemStyles("analytics-most-active-sites")}
                  onClick={() => handleItemClick("analytics-most-active-sites")}
                >
                  <span style={{ margin: "4px 0" }}>Most Active Sites</span>
                </Box>
                <Box
                  sx={getSubItemStyles("analytics-top-requests")}
                  onClick={() => handleItemClick("analytics-top-requests")}
                >
                  <span style={{ margin: "4px 0" }}>Top Requests</span>
                </Box>
                <Box
                  sx={getSubItemStyles("analytics-threats")}
                  onClick={() => handleItemClick("analytics-threats")}
                >
                  <span style={{ margin: "4px 0" }}>Threats</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Reports Link — a single destination; the page's own tabs cover
              Report Library / Schedules / History. */}
          {withCollapsedTooltip(
            "Reports",
            <Box
              sx={getItemStyles("reporting")}
              onClick={() => {
                handleItemClick("reporting");
                navigate("/reporting/scheduled-reports");
              }}
            >
              <DescriptionOutlinedIcon
                sx={{ fontSize: isExpanded ? 20 : 24 }}
              />
              {isExpanded && <span style={{ margin: "4px 0" }}>Reports</span>}
            </Box>,
          )}

          {/* Reports v2 — the same page with drawer-based scheduling. */}
          {withCollapsedTooltip(
            "Reports v2",
            <Box
              sx={getItemStyles("reporting-v2")}
              onClick={() => {
                handleItemClick("reporting-v2");
                navigate("/reporting/reports-v2");
              }}
            >
              <DescriptionOutlinedIcon
                sx={{ fontSize: isExpanded ? 20 : 24 }}
              />
              {isExpanded && (
                <span style={{ margin: "4px 0" }}>Reports v2</span>
              )}
            </Box>,
          )}

          {sectionLabel("Admin")}

          {/* Organization Link */}
          <Box sx={getDropdownWrapperStyles("organization")}>
            {withCollapsedTooltip(
              isOrganization ? "Organization" : "MSP",
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
                          {isOrganization ? "Organization" : "MSP"}
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
                {!isExpanded && <Icon name="business" size={24} />}
              </Box>,
            )}
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
                  sx={getSubItemStyles("organization-subscriptions")}
                  onClick={() => {
                    handleItemClick("organization-subscriptions");
                    navigate("/subscriptions");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Subscriptions</span>
                </Box>
                <Box
                  sx={getSubItemStyles("organization-old-billing")}
                  onClick={() => {
                    handleItemClick("organization-old-billing");
                    navigate("/subscriptions/old-billing");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Old Billing</span>
                </Box>
                <Box
                  sx={getSubItemStyles("organization-branding")}
                  onClick={() => {
                    handleItemClick("organization-branding");
                    navigate("/msp/branding");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Branding</span>
                </Box>
                <Box
                  sx={getSubItemStyles("organization-settings")}
                  onClick={() => {
                    handleItemClick("organization-settings");
                    navigate("/msp/settings");
                  }}
                >
                  <span style={{ margin: "4px 0" }}>Settings</span>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Tools Link */}
          <Box sx={getDropdownWrapperStyles("tools")}>
            {withCollapsedTooltip(
              "Tools",
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
                {!isExpanded && <Icon name="build" size={24} />}
              </Box>,
            )}
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
          {withCollapsedTooltip(
            "Integrations",
            <Box
              sx={getItemStyles("integrations")}
              onClick={() => handleItemClick("integrations")}
            >
              {/* An SVG rather than an Icon ligature: the installed Material
                  Symbols font has no miscellaneous_services glyph, so the font
                  route renders the name as text. */}
              <MiscellaneousServicesOutlinedIcon
                sx={{ fontSize: isExpanded ? 20 : 24 }}
              />
              {isExpanded && (
                <span style={{ margin: "4px 0" }}>Integrations</span>
              )}
            </Box>,
          )}
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
              {withCollapsedTooltip(
                "Account",
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
                          <span style={{ margin: "4px 0 4px 8px" }}>
                            Account
                          </span>
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
                </Box>,
              )}
              {/* Account Dropdown Items */}
              <Collapse in={expandedDropdown === "account" && isExpanded}>
                <Box
                  sx={{
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    backgroundColor: lightPalette.grey[900],
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
            {withCollapsedTooltip(
              "Domain Report",
              <Box
                sx={getItemStyles("domain-report")}
                onClick={() => handleItemClick("domain-report")}
              >
                <Icon
                  name="integration_instructions"
                  size={isExpanded ? 20 : 24}
                />
                {isExpanded && (
                  <span style={{ margin: "4px 0" }}>Domain Report</span>
                )}
              </Box>,
            )}
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
              <Icon name="check_circle" size={24} color="rgb(30, 241, 162)" />
            )}
          </Box>
        </Box>
      </Box>
    </DrawerContainer>
  );
}
