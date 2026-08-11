// How a clientless deployment's endpoint is handed to a device. Shared by the
// create/edit page, which generates one type at a time, and the connection
// details drawer, which lists them all — so the two can't disagree on what an
// endpoint looks like or how it's installed.

// Windows needs the resolver IP alongside the URL; the others take a single
// value.
export const DOH_TYPES = ["URL", "Stamp", "Windows", "macOS/iOS"] as const;
export type DohType = (typeof DOH_TYPES)[number];

// DNSFilter anycast resolver, shown with the URL for the Windows flow.
export const RESOLVER_IP = "103.247.36.36";

// The destination field is named differently per platform, so the label and
// the instructions follow the type.
export const DOH_FIELD: Record<DohType, { label: string; helper: string }> = {
  URL: {
    label: "DoH Endpoint",
    helper:
      "Paste this URL into the device's custom DoH or secure DNS setting.",
  },
  Stamp: {
    label: "DNS Stamp",
    helper: "Paste this stamp into UniFi or dnscrypt-proxy.",
  },
  Windows: {
    label: "DoH Endpoint",
    helper:
      "Enter the Resolver IP as Preferred DNS, then set DNS over HTTPS to On (manual template) with this URL.",
  },
  "macOS/iOS": {
    label: "Configuration Profile",
    helper:
      "Download the profile, then install it on the device or upload it to MDM.",
  },
};

/** The value a device is given, for one delivery type of one endpoint token. */
export function endpointFor(token: string, type: DohType) {
  return type === "Stamp"
    ? `sdns://AgcAAAAAAAAAAAAOZG9oLmRuc2ZpbHRlci5jb20K${token}`
    : `https://doh.dnsfilter.com/${token}`;
}
