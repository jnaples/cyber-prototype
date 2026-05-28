import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  LinearProgress,
  Link,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { brandConfig } from "@/theme/brand-config";

function MaterialIcon({
  name,
  size = 20,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, color, lineHeight: 1 }}
    >
      {name}
    </span>
  );
}

type ActivityRow = {
  label: string;
  duration: string;
  percent: number;
  users: number;
};

type ActivityCardProps = {
  count: number;
  title: string;
  rows: ActivityRow[];
  barColor: string;
};

function ActivityCard({ count, title, rows, barColor }: ActivityCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent
        sx={{
          p: "16px !important",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: brandConfig.fontFamily.secondary,
              fontWeight: 600,
              fontSize: 18,
              lineHeight: 1.33,
            }}
          >
            {count.toLocaleString()} {title}
          </Typography>
          <Link
            href="#"
            underline="none"
            sx={{
              fontFamily: brandConfig.fontFamily.primary,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.46px",
              textTransform: "uppercase",
              color: "secondary.main",
            }}
          >
            View All
          </Link>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {rows.map((row) => (
            <Box
              key={row.label}
              sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography
                  noWrap
                  sx={{ fontSize: 14, color: "text.primary", flex: 1 }}
                >
                  {row.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.duration} ({row.percent.toFixed(2)}%)
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={Math.min(row.percent, 100)}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: barColor,
                      borderRadius: 3,
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    minWidth: 70,
                    justifyContent: "flex-end",
                  }}
                >
                  <MaterialIcon name="person" size={16} />
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.users} {row.users === 1 ? "User" : "Users"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

const CYBERSIGHT_TABS = [
  { label: "Activity Overview", icon: "dashboard" },
  { label: "Timeline", icon: "view_timeline" },
  { label: "Threat Trends", icon: "shield" },
  { label: "Activity Logs", icon: "view_list" },
  { label: "AI Usage", icon: "hub" },
] as const;

const WEBSITES: ActivityRow[] = [
  { label: "portal.zorustech.com", duration: "72h 59m", percent: 57.35, users: 3 },
  { label: "dnsfilter.atlassian.net", duration: "21h 32m", percent: 13.01, users: 1 },
  { label: "docs.google.com", duration: "8h 6m", percent: 4.89, users: 2 },
  { label: "mail.google.com", duration: "4h 39m", percent: 2.81, users: 2 },
  { label: "meet.google.com", duration: "3h 55m", percent: 2.37, users: 1 },
  { label: "zorustech.atlassian.net", duration: "3h 19m", percent: 2.01, users: 1 },
  { label: "calendar.google.com", duration: "3h 14m", percent: 1.96, users: 1 },
  { label: "portal-staging.zorustech.com", duration: "2h 53m", percent: 1.74, users: 1 },
  { label: "www.lowes.com", duration: "1h 49m", percent: 1.1, users: 1 },
  { label: "chatgpt.com", duration: "1h 35m", percent: 0.96, users: 1 },
];

const APPLICATIONS: ActivityRow[] = [
  { label: "Slack", duration: "53h 30m", percent: 45, users: 3 },
  { label: "Google Chrome", duration: "26h 45m", percent: 23, users: 3 },
  { label: "Discord", duration: "1h 37m", percent: 1.4, users: 1 },
  { label: "Zoom", duration: "1h 32m", percent: 1.3, users: 2 },
  { label: "Microsoft\u00ae Windows\u00ae Operating System", duration: "1h 27m", percent: 1.25, users: 2 },
  { label: "Microsoft Excel", duration: "1h 13m", percent: 1.05, users: 1 },
  { label: "HPSystemEventUtilityHost.OSD", duration: "24m", percent: 0.35, users: 1 },
  { label: "Snipping Tool", duration: "16m", percent: 0.23, users: 1 },
  { label: "Microsoft Word", duration: "9m", percent: 0.13, users: 1 },
  { label: "ScreenConnect", duration: "8m", percent: 0.11, users: 1 },
];

const CATEGORIES: ActivityRow[] = [
  { label: "Computing & Internet", duration: "96h 18m", percent: 60, users: 3 },
  { label: "Web based Mail", duration: "4h 31m", percent: 2.8, users: 2 },
  { label: "Web Conferencing", duration: "3h 59m", percent: 2.5, users: 1 },
  { label: "Business & Commercial", duration: "3h 58m", percent: 2.48, users: 3 },
  { label: "Reference", duration: "3h 19m", percent: 2.07, users: 1 },
  { label: "Shopping/Retail", duration: "3h 12m", percent: 2, users: 3 },
  { label: "Artificial Intelligence", duration: "2h 13m", percent: 1.38, users: 1 },
  { label: "LinkedIn", duration: "1h 15m", percent: 0.78, users: 1 },
  { label: "Search Engines & Portals", duration: "59m", percent: 0.61, users: 1 },
  { label: "Education", duration: "58m", percent: 0.6, users: 1 },
];

const STREAMING: ActivityRow[] = [
  { label: "Google Chrome", duration: "49h 10m", percent: 89.77, users: 2 },
  { label: "Zoom", duration: "13h 46m", percent: 8.47, users: 2 },
  { label: "Slack", duration: "2h 45m", percent: 1.7, users: 1 },
  { label: "Discord", duration: "5m", percent: 0.05, users: 1 },
  { label: "Snipping Tool", duration: "< 1m", percent: 0.0, users: 1 },
];

const AI_TOOLS: ActivityRow[] = [
  { label: "Claude", duration: "72h 58m", percent: 47.35, users: 3 },
  { label: "chatgpt", duration: "65h 29m", percent: 17.35, users: 3 },
  { label: "GitHub Copilot", duration: "48h 6m", percent: 12.83, users: 2 },
  { label: "Cursor", duration: "30h 39m", percent: 8.81, users: 2 },
  { label: "perplexity.ai", duration: "13h 55m", percent: 7.37, users: 2 },
  { label: "copy.ai", duration: "2h 45m", percent: 3.01, users: 1 },
  { label: "higsfield.ai", duration: "45m", percent: 2.5, users: 3 },
  { label: "grok.x.ai", duration: "29m", percent: 1.0, users: 1 },
];

const CLIENTS: ActivityRow[] = [
  { label: "z-ktrojanowski", duration: "430h 50m", percent: 80, users: 3 },
  { label: "YOGA-BSMITH", duration: "55h 34m", percent: 15, users: 2 },
  { label: "px-home", duration: "35h 16m", percent: 9, users: 1 },
  { label: "IHOP-LAPTOP-04", duration: "22h 40m", percent: 6, users: 1 },
  { label: "HD-LAPTOP-24", duration: "18h 12m", percent: 5, users: 1 },
  { label: "smith-j", duration: "14h 55m", percent: 4, users: 1 },
  { label: "CC-LAPTOP-3", duration: "11h 8m", percent: 3, users: 1 },
  { label: "IHOP-DESKTOP-11", duration: "8h 33m", percent: 2.3, users: 1 },
  { label: "IHOP-SURFACE-09", duration: "5h 47m", percent: 1.5, users: 1 },
  { label: "IHOP-MACBOOK-07", duration: "3h 21m", percent: 0.9, users: 1 },
];

const FILTER_OPTIONS = {
  site: ["IHOP", "All Sites"],
  roamingClients: ["All Roaming Clients"],
  users: ["All Users"],
};

export default function CyberSightPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box
      sx={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        pb: "80px",
      }}
    >
      {/* Page header + filter bar */}
      <Box sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
        <PageHeader title="CyberSight" />
        <Box
          sx={{
            px: 2,
            pb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            <Autocomplete
              size="small"
              options={FILTER_OPTIONS.site}
              defaultValue="IHOP"
              renderInput={(params) => <TextField {...params} />}
            />
            <Autocomplete
              size="small"
              options={FILTER_OPTIONS.roamingClients}
              defaultValue="All Roaming Clients"
              renderInput={(params) => <TextField {...params} />}
            />
            <Autocomplete
              size="small"
              options={FILTER_OPTIONS.users}
              defaultValue="All Users"
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              defaultValue="Apr 2, 2050 - Apr 9, 2050"
              slotProps={{
                input: {
                  startAdornment: (
                    <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                      <MaterialIcon name="calendar_month" size={20} />
                    </Box>
                  ),
                },
              }}
            />
            <TextField
              size="small"
              defaultValue="08:00 AM - 06:00 PM"
              slotProps={{
                input: {
                  startAdornment: (
                    <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                      <MaterialIcon name="schedule" size={20} />
                    </Box>
                  ),
                },
              }}
            />
            <FormControlLabel
              control={<Switch size="small" />}
              label="Exclude Weekends"
              sx={{ ml: 0 }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" size="small">
              Apply
            </Button>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="text"
                color="error"
                size="small"
                startIcon={<MaterialIcon name="close" size={16} />}
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<MaterialIcon name="refresh" size={16} />}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Tab nav */}
        <Box
          sx={{
            px: 3,
            pt: 1,
            bgcolor: "background.neutral",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            aria-label="cybersight tabs"
            sx={{ minHeight: 0 }}
          >
            {CYBERSIGHT_TABS.map((tab) => (
              <Tab
                key={tab.label}
                label={tab.label}
                icon={<MaterialIcon name={tab.icon} size={20} />}
                iconPosition="start"
                sx={{
                  minHeight: 0,
                  textTransform: "none",
                  fontSize: 13,
                  py: 0.5,
                  px: 1,
                  mr: 2,
                  gap: 0.75,
                  "&.Mui-selected": {
                    backgroundColor: (
                      theme: Theme & {
                        vars?: {
                          palette?: { background?: { paper?: string } };
                        };
                      },
                    ) =>
                      theme.vars?.palette?.background?.paper ??
                      theme.palette.background.paper,
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    boxShadow: (theme: Theme) => theme.shadows[3],
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* Activity summary grid */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          <ActivityCard
            count={127}
            title="Websites"
            rows={WEBSITES}
            barColor={brandConfig.palette.primary.light.main}
          />
          <ActivityCard
            count={84}
            title="Applications"
            rows={APPLICATIONS}
            barColor={brandConfig.palette.pairingPurple.light.main}
          />
          <ActivityCard
            count={42}
            title="Categories"
            rows={CATEGORIES}
            barColor={brandConfig.palette.warning.light.main}
          />
          <ActivityCard
            count={12}
            title="Streaming Activities"
            rows={STREAMING}
            barColor={brandConfig.palette.pairingTeal.light.main}
          />
          <ActivityCard
            count={18}
            title="AI Tools"
            rows={AI_TOOLS}
            barColor={brandConfig.palette.tertiary.light.main}
          />
          <ActivityCard
            count={36}
            title="Clients"
            rows={CLIENTS}
            barColor={brandConfig.palette.success.light.main}
          />
        </Box>

        {/* Active Time Trend */}
        <Card>
          <CardContent sx={{ p: "16px !important" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: brandConfig.fontFamily.secondary,
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: 1.33,
                }}
              >
                Active Time Trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average of 8.77 hours per day
              </Typography>
            </Box>
            <Box
              sx={{
                height: 280,
                bgcolor: "background.default",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <MaterialIcon name="show_chart" size={40} color="currentColor" />
              <Typography variant="body2" color="text.secondary">
                Active time trend chart
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                mt: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 2,
                    bgcolor: brandConfig.palette.primary.light.main,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 12 }}
                >
                  Active Time
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 2,
                    bgcolor: brandConfig.palette.pairingTeal.light.main,
                    borderStyle: "dashed",
                    borderWidth: "1px 0 0 0",
                    borderColor: brandConfig.palette.pairingTeal.light.main,
                    backgroundColor: "transparent",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 12 }}
                >
                  Active Time Trend
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
