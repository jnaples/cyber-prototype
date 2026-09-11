// Tray shell — the same standalone sidebar layout /reports uses. Reached by
// direct URL only: deliberately absent from the app's side nav.

import { SidebarShell, type SidebarGroup } from "@/components/sidebar-shell";

const BASE = "/tray";

const TRAY_GROUPS: SidebarGroup[] = [
  { items: [{ label: "Tray Variants", path: `${BASE}/tray-variants` }] },
];

export default function TrayLayout() {
  return <SidebarShell groups={TRAY_GROUPS} />;
}
