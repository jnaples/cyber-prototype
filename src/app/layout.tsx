import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router";

import Footer from "@/components/footer";
import Sidebar from "@/components/side-nav/side-nav";
import { MSP_DASHBOARDS } from "@/data/organizations";
import { OrgScopeContext } from "@/hooks/use-org-scope";
import { isOrganizationName, WorkspaceContext } from "@/hooks/use-workspace";

export default function RootLayout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { pathname } = useLocation();

  // Held here rather than in the side nav so pages can label themselves from
  // the same selection the org switcher makes.
  const [workspaceName, setWorkspaceName] = useState(MSP_DASHBOARDS[0]);
  // Organization drill-down, set by the page header's scope chip and read by
  // the grids below it.
  const [scopedOrg, setScopedOrg] = useState<string | null>(null);
  const orgScope = useMemo(
    () => ({ organization: scopedOrg, setOrganization: setScopedOrg }),
    [scopedOrg],
  );
  const workspace = useMemo(
    () => ({
      name: workspaceName,
      isOrganization: isOrganizationName(workspaceName),
      select: setWorkspaceName,
    }),
    [workspaceName],
  );

  // The design-system docs render their own shell (component sidebar + header),
  // so the app side nav is hidden there.
  const hideSidebar = pathname.startsWith("/design-system");
  // Secure Shield is a full-canvas page — the global footer would overlap it.
  const hideFooter = pathname.startsWith("/secureshield") || hideSidebar;

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <WorkspaceContext.Provider value={workspace}>
      <OrgScopeContext.Provider value={orgScope}>
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            overflow: "hidden",
            width: "100%",
            height: "100svh",
          }}
        >
          {!hideSidebar && (
            <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </Box>
          {!hideFooter && <Footer sidebarWidth={isExpanded ? 280 : 72} />}
        </Box>
      </OrgScopeContext.Provider>
    </WorkspaceContext.Provider>
  );
}
