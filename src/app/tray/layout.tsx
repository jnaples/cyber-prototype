// Tray shell — the same standalone sidebar layout /reports uses. Reached by
// direct URL only: deliberately absent from the app's side nav.

import { SidebarShell, type SidebarGroup } from "@/components/sidebar-shell";

const BASE = "/tray";

const TRAY_GROUPS: SidebarGroup[] = [
  {
    items: [
      { label: "DNSFilter One App", path: `${BASE}/dnsfilter-one-app` },
      { label: "DNSFilter One App v2", path: `${BASE}/dnsfilter-one-app-v2` },
      { label: "DNSFilter One App v3", path: `${BASE}/dnsfilter-one-app-v3` },
      { label: "Tray Variants", path: `${BASE}/tray-variants` },
    ],
  },
];

export default function TrayLayout() {
  return <SidebarShell groups={TRAY_GROUPS} />;
}
