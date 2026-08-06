// The report catalog shared by the Report Manager Library tab and the
// Schedule Report builder.

import type { SvgIconComponent } from "@mui/icons-material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import StackedLineChartOutlinedIcon from "@mui/icons-material/StackedLineChartOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";

export type ReportDef = {
  key: string;
  title: string;
  desc: string;
  Icon: SvgIconComponent;
  file: string;
  size: string;
  cybersight?: boolean;
};

export const REPORTS: ReportDef[] = [
  {
    key: "activity",
    title: "Customer Activity Overview",
    desc: "Requests, blocked traffic, and top categories across the period.",
    Icon: StackedLineChartOutlinedIcon,
    file: "Activity-Overview-Jul-2026.pdf",
    size: "1.2 MB",
  },
  {
    key: "traffic",
    title: "DNS Query Logs",
    desc: "Full DNS request log for every endpoint, exported as a CSV.",
    Icon: TableChartOutlinedIcon,
    file: "DNS-Query-Logs-Jul-2026.csv",
    size: "840 KB",
  },
  {
    key: "protection",
    title: "Filter Protection Summary",
    desc: "Threats blocked, categories filtered, and policy coverage.",
    Icon: ShieldOutlinedIcon,
    file: "Protection-Summary-Jul-2026.pdf",
    size: "1.1 MB",
  },
  {
    key: "timeline-logs",
    title: "Timeline Activity Logs",
    desc: "Detailed CyberSight timeline events for each device.",
    Icon: ReceiptLongOutlinedIcon,
    file: "Timeline-Logs-Jul-2026.pdf",
    size: "1.4 MB",
    cybersight: true,
  },
  {
    key: "timeline-overview",
    title: "Timeline Overview",
    desc: "Summarized device timelines with notable activity called out.",
    Icon: ShowChartOutlinedIcon,
    file: "Timeline-Overview-Jul-2026.pdf",
    size: "980 KB",
    cybersight: true,
  },
  {
    key: "ai-usage",
    title: "CyberSight AI Usage",
    desc: "AI queries, insights generated, and usage by device.",
    Icon: AutoAwesomeOutlinedIcon,
    file: "AI-Usage-Jul-2026.pdf",
    size: "760 KB",
    cybersight: true,
  },
];
