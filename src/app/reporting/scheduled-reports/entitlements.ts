// Which products an organization is licensed for. One client is on Filtering
// only, so its CyberSight reports show an upgrade instead of running.

/** The organization used to demonstrate a Filtering-only plan. */
export const NO_CYBERSIGHT_ORG = "Acme Retail Group";

/** True when `organization` can't run a CyberSight report. */
export function cyberSightLocked(
  organization: string | null,
  products: string[] = [],
) {
  return organization === NO_CYBERSIGHT_ORG && products.includes("CyberSight");
}

/** Billing & Subscriptions, alongside whatever the user was looking at. */
export const openBilling = () =>
  window.open("/subscriptions/manage", "_blank", "noopener");
