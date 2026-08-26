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
import { useNavigate } from "react-router";

import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

import { AppAwareControls } from "./appaware-controls";

type PolicyTab = {
  label: string;
  Icon: SvgIconComponent;
  /** Placeholder copy until the tab is built. */
  blurb: string;
};

const TABS: PolicyTab[] = [
  {
    label: "Settings",
    Icon: SettingsOutlinedIcon,
    blurb: "Policy name, description, and the organizations it applies to.",
  },
  {
    label: "Categories",
    Icon: LibraryBooksOutlinedIcon,
    blurb: "Which content categories this policy blocks.",
  },
  {
    label: "Threats",
    Icon: ShieldOutlinedIcon,
    blurb: "Threat types to block — malware, phishing, botnets and the rest.",
  },
  {
    label: "AppAware",
    Icon: AppsOutlinedIcon,
    blurb: "Applications this policy allows or blocks.",
  },
  {
    label: "Privacy",
    Icon: PrivacyTipOutlinedIcon,
    blurb: "What the policy logs, and for how long.",
  },
  {
    label: "Allow List",
    Icon: CheckCircleOutlinedIcon,
    blurb: "Domains that always resolve, whatever else the policy says.",
  },
  {
    label: "Block List",
    Icon: BlockOutlinedIcon,
    blurb: "Domains that never resolve under this policy.",
  },
  {
    label: "Labs",
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

export default function CreatePolicyPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const active = TABS[tab];
  const back = () => navigate("/global-policies");

  return (
    <PageShell
      // AppAware's cards cap at the content area's height, so the shell has to
      // bound it rather than letting the body scroll.
      fill={active.label === "AppAware"}
      header={
        <PageHeader
          title="Create New Policy"
          onBack={back}
          actions={
            <>
              <Button variant="outlined" color="secondary" onClick={back}>
                Cancel
              </Button>
              {/* Nothing to save until the tabs are built. */}
              <Button variant="contained" color="primary" disabled>
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
              value={tab}
              onChange={(_event, next: number) => setTab(next)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="policy tabs"
              sx={{ px: 3 }}
            >
              {TABS.map(({ label, Icon }) => (
                <Tab
                  key={label}
                  label={label}
                  icon={<Icon sx={{ fontSize: 20 }} />}
                  sx={selectedTabSx}
                />
              ))}
            </Tabs>
          </Box>
        </PageHeader>
      }
    >
      {active.label === "AppAware" ? (
        <AppAwareControls />
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
