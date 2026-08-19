// The real report documents under /reports, keyed by catalog entry. Anything
// without a built page falls back to the sample cover sheet.
//
// Its own module so the preview pane and the print/download path resolve a
// report to the same document.

import type { ComponentType } from "react";

import CustomerActivityOverviewReport from "@/app/reports/customer-activity-overview/page";
import CyberSightAiUsageReport from "@/app/reports/cybersight-ai-usage/page";
import FilterProtectionSummaryReport from "@/app/reports/filter-protection-summary/page";
import ThreatTrendsReport from "@/app/reports/threat-trends/page";
import TimelineOverviewReport from "@/app/reports/timeline-overview/page";

import { CustomReportSheet } from "./custom-report-sheet";
import { QueryLogsCsvSheet } from "./query-logs-csv-sheet";
import { TimelineLogsCsvSheet } from "./timeline-logs-csv-sheet";

export const REPORT_PAGES: Record<string, ComponentType> = {
  activity: CustomerActivityOverviewReport,
  traffic: QueryLogsCsvSheet,
  protection: FilterProtectionSummaryReport,
  "timeline-logs": TimelineLogsCsvSheet,
  "timeline-overview": TimelineOverviewReport,
  "threat-trends": ThreatTrendsReport,
  "ai-usage": CyberSightAiUsageReport,
  // Nothing built yet — a blank page with the report mark.
  custom: CustomReportSheet,
};
