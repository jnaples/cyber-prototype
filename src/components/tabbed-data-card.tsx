import { Tab, Tabs } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import React from "react";

import { StatusTab } from "@/components/status-tab";

export interface StatusTabConfig {
  icon: string;
  count: number;
  label: string;
  color: string;
  iconColorVar: string;
  progressValue: number;
  showInfoIcon?: boolean;
  infoTooltip?: React.ReactNode;
}

export interface TabbedDataCardProps {
  tabs?: StatusTabConfig[];
  activeTab?: number;
  onTabChange?: (event: React.SyntheticEvent, newValue: number) => void;
  children: React.ReactNode;
}

export function TabbedDataCard({
  tabs,
  activeTab = 0,
  onTabChange,
  children,
}: TabbedDataCardProps) {
  return (
    <Card
      sx={{
        minWidth: 0,
        width: "100%",
        maxWidth: "100%",
        p: 0,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: "0 !important",
          "&:last-child": { pb: "0 !important" },
          overflow: "auto",
        }}
      >
        {tabs && tabs.length > 0 && (
          <Box
            sx={{
              backgroundColor: "background.neutral",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={onTabChange}
              aria-label="status tabs"
              variant="fullWidth"
              sx={{
                "& .MuiTabs-list": { width: "100%" },
                "& .Mui-selected": { backgroundColor: "background.paper" },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  sx={{
                    flex: 1,
                    height: "auto",
                    minHeight: "auto",
                    padding: "9px 16px",
                    maxWidth: "none",
                    justifyContent: "center",
                    borderRadius: "6px 6px 0px 0px",
                  }}
                  label={
                    <StatusTab
                      icon={tab.icon}
                      count={tab.count}
                      label={tab.label}
                      color={tab.color}
                      iconColorVar={tab.iconColorVar}
                      progressValue={tab.progressValue}
                      isSelected={activeTab === index}
                      showInfoIcon={tab.showInfoIcon}
                      infoTooltip={tab.infoTooltip}
                    />
                  }
                />
              ))}
            </Tabs>
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
