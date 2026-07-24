import { Navigate, Route, Routes } from "react-router";

import RootLayout from "@/app/layout";
import CybersightPage from "@/app/cybersight/page";
import GlobalPoliciesPage from "@/app/global-policies/page";
import SecureShieldPage from "@/app/secureshield/page";
import DeploymentsLayout from "@/app/deployments/layout";
import DeploymentsIndexPage from "@/app/deployments/page";
import RoamingClientsPage from "@/app/deployments/roaming-clients/page";
import ClientlessPage from "@/app/deployments/clientless/page";
import CreateClientlessPage from "@/app/deployments/clientless/create/page";
import SitesPage from "@/app/deployments/sites/page";
import DesignSystemLayout from "@/app/design-system/layout";
import AlertsDocsPage from "@/app/design-system/alerts/page";
import ButtonsDocsPage from "@/app/design-system/buttons/page";
import CardsDocsPage from "@/app/design-system/cards/page";
import ChipsDocsPage from "@/app/design-system/chips/page";
import FormsDocsPage from "@/app/design-system/forms/page";
import PageHeaderDocsPage from "@/app/design-system/page-header/page";
import TypographyDocsPage from "@/app/design-system/typography/page";
import OverviewPage from "@/app/overview/page";
import DashboardsPage from "@/app/dashboards/page";
import OrganizationSettingsPage from "@/app/msp/settings/page";
import ManageDashboardsPage from "@/app/dashboards/manage/page";
import HomePage from "@/app/page";
import QueryLogsPage from "@/app/query-logs/page";
import CustomReportsPage from "@/app/reporting/custom-reports/page";
import ScheduledReportsPage from "@/app/reporting/scheduled-reports/page";
import ReportsLayout from "@/app/reports/layout";
import CustomerActivityOverviewReport from "@/app/reports/customer-activity-overview/page";
import ThreatTrendsReport from "@/app/reports/threat-trends/page";
import CyberSightAiUsageReport from "@/app/reports/cybersight-ai-usage/page";
import TimelineOverviewReport from "@/app/reports/timeline-overview/page";
import FilterProtectionSummaryReport from "@/app/reports/filter-protection-summary/page";
import { ReportPlaceholder } from "@/app/reports/report-placeholder";
import SettingsPage from "@/app/settings/page";
import UnblockRequestsLayout from "@/app/unblock-requests/layout";
import UnblockRequestsIndexPage from "@/app/unblock-requests/page";
import ActiveRequestsPage from "@/app/unblock-requests/active-requests/page";
import RequestHistoryPage from "@/app/unblock-requests/request-history/page";
import SubscriptionsLayout from "@/app/subscriptions/layout";
import SubscriptionsIndexPage from "@/app/subscriptions/page";
import SubscriptionsManagePage from "@/app/subscriptions/manage/page";
import BillingPage from "@/app/subscriptions/billing/page";
import OldBillingPage from "@/app/subscriptions/old-billing/page";
import PlansLicensesPage from "@/app/subscriptions/plans-licenses/page";

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route element={<RootLayout />}>
        <Route path="overview" element={<OverviewPage />} />
        <Route path="global-policies" element={<GlobalPoliciesPage />} />
        <Route path="global-policies/filter" element={<GlobalPoliciesPage />} />
        <Route path="dashboards" element={<DashboardsPage />} />
        <Route path="dashboards/manage" element={<ManageDashboardsPage />} />
        <Route path="cybersight" element={<CybersightPage />} />
        <Route path="secureshield" element={<SecureShieldPage />} />
        <Route path="query-logs" element={<QueryLogsPage />} />
        <Route path="reporting">
          <Route path="custom-reports" element={<CustomReportsPage />} />
          <Route path="scheduled-reports" element={<ScheduledReportsPage />} />
        </Route>
        <Route path="settings" element={<SettingsPage />} />
        <Route path="msp/settings" element={<OrganizationSettingsPage />} />

        <Route path="subscriptions" element={<SubscriptionsLayout />}>
          <Route index element={<SubscriptionsIndexPage />} />
          <Route path="manage" element={<SubscriptionsManagePage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="plans-licenses" element={<PlansLicensesPage />} />
        </Route>
        <Route path="subscriptions/old-billing" element={<OldBillingPage />} />

        <Route path="deployments" element={<DeploymentsLayout />}>
          <Route index element={<DeploymentsIndexPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="roaming-clients" element={<RoamingClientsPage />} />
          <Route path="clientless" element={<ClientlessPage />} />
        </Route>
        <Route
          path="deployments/clientless/create"
          element={<CreateClientlessPage />}
        />

        <Route path="unblock-requests" element={<UnblockRequestsLayout />}>
          <Route index element={<UnblockRequestsIndexPage />} />
          <Route path="active" element={<ActiveRequestsPage />} />
          <Route path="history" element={<RequestHistoryPage />} />
        </Route>

        <Route path="design-system" element={<DesignSystemLayout />}>
          <Route index element={<Navigate to="buttons" replace />} />
          <Route path="alerts" element={<AlertsDocsPage />} />
          <Route path="buttons" element={<ButtonsDocsPage />} />
          <Route path="cards" element={<CardsDocsPage />} />
          <Route path="chips" element={<ChipsDocsPage />} />
          <Route path="forms" element={<FormsDocsPage />} />
          <Route path="page-header" element={<PageHeaderDocsPage />} />
          <Route path="typography" element={<TypographyDocsPage />} />
        </Route>
      </Route>

      {/* Reports has its own sidebar — rendered outside the app shell so the
          main side nav isn't also shown. */}
      <Route path="reports" element={<ReportsLayout />}>
        <Route
          index
          element={<Navigate to="customer-activity-overview" replace />}
        />
        <Route
          path="customer-activity-overview"
          element={<CustomerActivityOverviewReport />}
        />
        <Route path="endpoint-traffic-logs" element={<ReportPlaceholder />} />
        <Route
          path="filter-protection-summary"
          element={<FilterProtectionSummaryReport />}
        />
        <Route path="timeline-activity-logs" element={<ReportPlaceholder />} />
        <Route path="timeline-overview" element={<TimelineOverviewReport />} />
        <Route path="cybersight-ai-usage" element={<CyberSightAiUsageReport />} />
        <Route path="threat-trends" element={<ThreatTrendsReport />} />
      </Route>
    </Routes>
  );
}

export default App;
