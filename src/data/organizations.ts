// The MSP's own dashboards, as opposed to the client organizations below.
// Which kind is selected changes how the app labels itself: an MSP dashboard
// spans every client, a single organization is scoped to one.
export const MSP_DASHBOARDS = ["MSPDash", "TechsRUs"];

// MSP organizations — the client orgs listed in the side-nav org switcher and
// offered when sharing a dashboard. Sorted alphabetically for display.
export const MSP_ORGANIZATIONS = [
  "Riverside Dental Group",
  "Summit Financial Advisors",
  "Coastal Property Mgmt",
  "Bright Future Pediatrics",
  "Vanguard Auto Repair",
  "Northwind Traders",
  "Acme Retail Group",
  "Lakeside Law Group",
].sort((a, b) => a.localeCompare(b));
