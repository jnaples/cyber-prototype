import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import { Box, Card, CardContent, Tab, Tabs, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import React, { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { useWorkspace } from "@/hooks/use-workspace";

import { FilteringTab } from "./filtering-tab";

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const TABS = [
  { label: "Filtering", icon: <FilterAltOutlinedIcon /> },
  { label: "Universal Lists", icon: <ListAltOutlinedIcon /> },
  { label: "Block Pages", icon: <BlockOutlinedIcon /> },
] as const;

function PlaceholderCard({ title }: { title: string }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
          {title} content will live here. This is a placeholder.
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function GlobalPoliciesPage() {
  const [tab, setTab] = useState(0);
  // Scoped to one organization, these are simply its policies.
  const { isOrganization } = useWorkspace();

  const selectedTabSx = {
    "&.Mui-selected": {
      backgroundColor: (
        theme: Theme & {
          vars?: { palette?: { background?: { paper?: string } } };
        },
      ) =>
        theme.vars?.palette?.background?.paper ??
        theme.palette.background.paper,
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      boxShadow: (theme: Theme) => theme.shadows[3],
      zIndex: (theme: Theme) => theme.zIndex.appBar,
    },
  };

  return (
    <PageShell
      // The Filtering tab's grid fills the page; the others scroll.
      fill={tab === 0}
      header={
        <PageHeader title={isOrganization ? "Policies" : "Global Policies"}>
          <Box
            sx={{
              mb: -2,
              display: "flex",
              alignContent: "flex-end",
              backgroundColor: (
                theme: Theme & {
                  vars?: { palette?: { background?: { neutral?: string } } };
                },
              ) =>
                theme.vars?.palette?.background?.neutral ??
                theme.palette.background.neutral,
              color: (
                theme: Theme & {
                  vars?: { palette?: { text?: { primary?: string } } };
                },
              ) =>
                theme.vars?.palette?.text?.primary ??
                theme.palette.text.primary,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_event: React.SyntheticEvent, value: number) =>
                setTab(value)
              }
              aria-label="global policies tabs"
              sx={{ px: 3 }}
            >
              {TABS.map((t) => (
                <Tab
                  key={t.label}
                  label={t.label}
                  icon={t.icon}
                  sx={selectedTabSx}
                />
              ))}
            </Tabs>
          </Box>
        </PageHeader>
      }
    >
      {tab === 0 ? (
        <FilteringTab />
      ) : (
        <PlaceholderCard title={TABS[tab].label} />
      )}
    </PageShell>
  );
}
