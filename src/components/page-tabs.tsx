// The tab rail a page carries under its header — Deployments, the report
// manager, AgentShield. The selected tab reads as a card lifted out of the
// neutral strip; everything else (height, icon size, gap) comes from the
// theme's MuiTab / MuiTabs overrides, so a rail here matches a rail there.

import { Box, Tab, Tabs } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { SyntheticEvent } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

export type PageTab = {
  label: string;
  /** Material Symbols name, drawn at the theme's 20px tab size. */
  icon: string;
};

/** Selected page tab reads as a card lifted out of the neutral strip. The
 *  theme's 90px minimum would leave a short label like "Logs" sitting in a
 *  card wider than itself, so a tab in the rail hugs its own content. */
const selectedTabSx = {
  minWidth: "auto",
  "&.Mui-selected": {
    backgroundColor: (theme: Theme) => theme.vars.palette.background.paper,
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    boxShadow: (theme: Theme) => theme.shadows[3],
    zIndex: (theme: Theme) => theme.zIndex.appBar,
  },
};

export function PageTabs({
  tabs,
  value,
  onChange,
  ariaLabel,
}: {
  tabs: readonly PageTab[];
  /** Index of the open tab. */
  value: number;
  onChange: (event: SyntheticEvent, value: number) => void;
  ariaLabel: string;
}) {
  return (
    <Box
      sx={{
        // The rail sits on the header's bottom edge rather than above it.
        mb: -2,
        display: "flex",
        alignContent: "flex-end",
        backgroundColor: "background.neutral",
        color: "text.primary",
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        sx={{ px: 3 }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            label={tab.label}
            icon={<MaterialSymbol name={tab.icon} size={20} />}
            sx={selectedTabSx}
          />
        ))}
      </Tabs>
    </Box>
  );
}
