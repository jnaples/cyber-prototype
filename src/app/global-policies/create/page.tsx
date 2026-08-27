// Create New Policy — the policy builder on its own route, one tab per group
// of settings. Only AppAware has real content so far; the rest hold a
// placeholder card until they're built.

import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

import { AppAwareControls } from "./appaware-controls";
import { AppAwareControlsV2 } from "./appaware-controls-v2";
import { AppAwareControlsV3 } from "./appaware-controls-v3";
import type { AppAwareState } from "./appaware-state";
import { DEFAULT_APPAWARE_STATE, isAppAwareDirty } from "./appaware-state";

type PolicyTab = {
  label: string;
  /** URL segment, so a tab can be linked and shared. */
  path: string;
  Icon: SvgIconComponent;
  /** Placeholder copy until the tab is built. */
  blurb: string;
};

const TABS: PolicyTab[] = [
  {
    label: "Settings",
    path: "settings",
    Icon: SettingsOutlinedIcon,
    blurb: "Policy name, description, and the organizations it applies to.",
  },
  {
    label: "Categories",
    path: "categories",
    Icon: LibraryBooksOutlinedIcon,
    blurb: "Which content categories this policy blocks.",
  },
  {
    label: "Threats",
    path: "threats",
    Icon: ShieldOutlinedIcon,
    blurb: "Threat types to block — malware, phishing, botnets and the rest.",
  },
  {
    label: "AppAware",
    path: "appaware",
    Icon: AppsOutlinedIcon,
    blurb: "Applications this policy allows or blocks.",
  },
  {
    label: "AppAware v2",
    path: "appaware-v2",
    Icon: AppsOutlinedIcon,
    blurb: "Applications this policy allows or blocks.",
  },
  {
    label: "AppAware v3",
    path: "appaware-v3",
    Icon: AppsOutlinedIcon,
    blurb: "Applications this policy allows or blocks.",
  },
  {
    label: "Privacy",
    path: "privacy",
    Icon: PrivacyTipOutlinedIcon,
    blurb: "What the policy logs, and for how long.",
  },
  {
    label: "Allow List",
    path: "allow-list",
    Icon: CheckCircleOutlinedIcon,
    blurb: "Domains that always resolve, whatever else the policy says.",
  },
  {
    label: "Block List",
    path: "block-list",
    Icon: BlockOutlinedIcon,
    blurb: "Domains that never resolve under this policy.",
  },
  {
    label: "Labs",
    path: "labs",
    Icon: ScienceOutlinedIcon,
    blurb: "Experimental protections, off by default.",
  },
];

// Selected tab reads as a card lifted out of the neutral strip, as the Report
// Manager's tabs do.
const selectedTabSx = {
  "&.Mui-selected": {
    backgroundColor: (theme: Theme) => theme.vars.palette.background.paper,
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    boxShadow: (theme: Theme) => theme.shadows[3],
    zIndex: (theme: Theme) => theme.zIndex.appBar,
  },
};

/** Marks a tab whose settings have been changed but not saved. */
function DirtyDot() {
  return (
    <Box
      sx={(theme) => ({
        width: 8,
        height: 8,
        ml: "6px",
        borderRadius: "999px",
        flexShrink: 0,
        bgcolor: theme.vars.palette.primary.main,
        ...theme.applyStyles("dark", {
          bgcolor: theme.vars.palette.primary.light,
        }),
      })}
    />
  );
}

export default function CreatePolicyPage() {
  const navigate = useNavigate();
  // The tab lives in the URL so a tab can be linked to directly; an unknown
  // or missing segment falls back to the first one.
  const { tab: tabPath } = useParams();
  const tabIndex = Math.max(
    0,
    TABS.findIndex((t) => t.path === tabPath),
  );
  const active = TABS[tabIndex];
  const back = () => navigate("/global-policies");

  // Each tab's edits live here rather than in the tab, so switching tabs keeps
  // them — and so the tab strip can mark which tabs have unsaved changes.
  const [appAware, setAppAware] = useState<AppAwareState>(
    DEFAULT_APPAWARE_STATE,
  );
  const appAwareDirty = isAppAwareDirty(appAware);
  const dirtyTabs: Record<string, boolean> = {
    appaware: appAwareDirty,
    "appaware-v2": appAwareDirty,
    "appaware-v3": appAwareDirty,
  };
  const dirty = Object.values(dirtyTabs).some(Boolean);

  return (
    <PageShell
      // AppAware's cards cap at the content area's height, so the shell has to
      // bound it rather than letting the body scroll.
      fill={active.path.startsWith("appaware")}
      header={
        <PageHeader
          title="Create New Policy"
          onBack={back}
          actions={
            <>
              <Button variant="outlined" color="secondary" onClick={back}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" disabled={!dirty}>
                Save Policy
              </Button>
            </>
          }
        >
          <Box
            sx={{
              mb: -2,
              display: "flex",
              alignContent: "flex-end",
              backgroundColor: (theme: Theme) =>
                theme.vars.palette.background.neutral,
              color: (theme: Theme) => theme.vars.palette.text.primary,
            }}
          >
            <Tabs
              value={tabIndex}
              onChange={(_event, next: number) =>
                navigate(`/global-policies/create/${TABS[next].path}`)
              }
              variant="scrollable"
              scrollButtons="auto"
              aria-label="policy tabs"
              sx={{ px: 3 }}
            >
              {TABS.map(({ label, path, Icon }) => (
                <Tab
                  key={label}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {label}
                      {dirtyTabs[path] && <DirtyDot />}
                    </Box>
                  }
                  icon={<Icon sx={{ fontSize: 20 }} />}
                  sx={selectedTabSx}
                />
              ))}
            </Tabs>
          </Box>
        </PageHeader>
      }
    >
      {active.path === "appaware" ? (
        <AppAwareControls state={appAware} onChange={setAppAware} />
      ) : active.path === "appaware-v2" ? (
        <AppAwareControlsV2 state={appAware} onChange={setAppAware} />
      ) : active.path === "appaware-v3" ? (
        <AppAwareControlsV3 state={appAware} onChange={setAppAware} />
      ) : (
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="cardTitle">{active.label}</Typography>
            <Typography variant="body1" sx={{ mt: 0.5, color: "text.primary" }}>
              {active.blurb}
            </Typography>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
