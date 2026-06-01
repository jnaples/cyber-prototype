import { Route, Routes } from "react-router";

import RootLayout from "@/app/layout";
import CybersightPage from "@/app/cybersight/page";
import DeploymentsLayout from "@/app/deployments/layout";
import DeploymentsIndexPage from "@/app/deployments/page";
import RoamingClientsPage from "@/app/deployments/roaming-clients/page";
import SitesPage from "@/app/deployments/sites/page";
import AlertsDocsPage from "@/app/design-system/alerts/page";
import ButtonsDocsPage from "@/app/design-system/buttons/page";
import CardsDocsPage from "@/app/design-system/cards/page";
import FormsDocsPage from "@/app/design-system/forms/page";
import PageHeaderDocsPage from "@/app/design-system/page-header/page";
import TypographyDocsPage from "@/app/design-system/typography/page";
import OverviewPage from "@/app/overview/page";
import HomePage from "@/app/page";
import QueryLogsPage from "@/app/query-logs/page";
import SettingsPage from "@/app/settings/page";
import SubscriptionsPage from "@/app/subscriptions/page";

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route element={<RootLayout />}>
        <Route path="overview" element={<OverviewPage />} />
        <Route path="cybersight" element={<CybersightPage />} />
        <Route path="query-logs" element={<QueryLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />

        <Route path="deployments" element={<DeploymentsLayout />}>
          <Route index element={<DeploymentsIndexPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="roaming-clients" element={<RoamingClientsPage />} />
        </Route>

        <Route path="design-system">
          <Route path="alerts" element={<AlertsDocsPage />} />
          <Route path="buttons" element={<ButtonsDocsPage />} />
          <Route path="cards" element={<CardsDocsPage />} />
          <Route path="forms" element={<FormsDocsPage />} />
          <Route path="page-header" element={<PageHeaderDocsPage />} />
          <Route path="typography" element={<TypographyDocsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
