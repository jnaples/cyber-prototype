// The report catalog shared by the Report Manager Library tab and the
// Schedule Report builder.

import type { SvgIconComponent } from "@mui/icons-material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import EqualizerOutlinedIcon from "@mui/icons-material/EqualizerOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import StackedLineChartOutlinedIcon from "@mui/icons-material/StackedLineChartOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import ViewTimelineOutlinedIcon from "@mui/icons-material/ViewTimelineOutlined";

export type ReportDef = {
  key: string;
  title: string;
  desc: string;
  Icon: SvgIconComponent;
  file: string;
  size: string;
  cybersight?: boolean;
  /** Products the report belongs to — rendered as chips on the report card. */
  products?: string[];
};

export const REPORTS: ReportDef[] = [
  {
    key: "activity",
    title: "Activity Overview",
    desc: "Requests, blocked traffic, and top categories across the period.",
    Icon: StackedLineChartOutlinedIcon,
    file: "Activity-Overview-Jul-2026.pdf",
    products: ["CyberSight"],
    size: "1.2 MB",
  },
  {
    key: "timeline-overview",
    title: "Timeline",
    desc: "Summarized device timelines with notable activity called out.",
    Icon: ViewTimelineOutlinedIcon,
    file: "Timeline-Overview-Jul-2026.pdf",
    products: ["CyberSight"],
    size: "980 KB",
    cybersight: true,
  },
  {
    key: "protection",
    title: "Filter Protection Summary",
    desc: "Threats blocked, categories filtered, and policy coverage.",
    Icon: EqualizerOutlinedIcon,
    file: "Protection-Summary-Jul-2026.pdf",
    products: ["Filtering"],
    size: "1.1 MB",
  },
  {
    key: "threat-trends",
    title: "Threat Trends",
    desc: "Threat events over time, with the domains and devices behind them.",
    Icon: ShieldOutlinedIcon,
    file: "Threat-Trends-Jul-2026.pdf",
    products: ["CyberSight"],
    size: "1.0 MB",
    cybersight: true,
  },
  {
    key: "ai-usage",
    title: "AI Usage",
    desc: "AI queries, insights generated, and usage by device.",
    Icon: AutoAwesomeOutlinedIcon,
    file: "AI-Usage-Jul-2026.pdf",
    products: ["CyberSight"],
    size: "760 KB",
    cybersight: true,
  },
  {
    key: "timeline-logs",
    title: "Activity Logs",
    desc: "Detailed CyberSight timeline events for each device, exported as a CSV.",
    Icon: ViewListOutlinedIcon,
    file: "Timeline-Logs-Jul-2026.csv",
    products: ["CyberSight"],
    size: "1.4 MB",
    cybersight: true,
  },
  {
    key: "traffic",
    title: "DNS Query Logs",
    desc: "Full DNS request log for every endpoint, exported as a CSV.",
    Icon: FormatListBulletedOutlinedIcon,
    file: "DNS-Query-Logs-Jul-2026.csv",
    products: ["Filtering"],
    size: "840 KB",
  },
  {
    key: "custom",
    title: "Custom Report",
    desc: "Your own selection of metrics, dimensions, and filters.",
    Icon: DashboardCustomizeOutlinedIcon,
    products: ["CyberSight", "Filtering"],
    file: "Custom-Report-Jul-2026.pdf",
    size: "890 KB",
  },
];
