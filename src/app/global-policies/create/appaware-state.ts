// The AppAware tab's policy state and its shipped defaults.
//
// Kept out of the component file so the Create Policy page can own the state
// (it has to survive a tab switch) without importing non-components from a
// component module.

import { APP_CATEGORIES } from "@/data/appaware-apps";

export type Policy = "allow" | "block";

/**
 * The catalog lives in src/data/appaware-apps.ts — 2,400 apps across the 14
 * categories. Add or move apps there; the rail, search, and grid all follow.
 */
export const CATEGORIES = APP_CATEGORIES;

// Everything is allowed by default except the categories a policy usually
// clamps down on; those also auto-block newly detected apps.
const BLOCKED_BY_DEFAULT = ["genai", "remote", "vpn"];

export const DEFAULT_POLICIES: Record<string, Policy> = Object.fromEntries(
  CATEGORIES.map((c) => [
    c.id,
    BLOCKED_BY_DEFAULT.includes(c.id) ? "block" : "allow",
  ]),
);

export const DEFAULT_AUTO_BLOCK: Record<string, boolean> = Object.fromEntries(
  BLOCKED_BY_DEFAULT.map((id) => [id, true]),
);

// The app rules that already override their category, as the design ships it.
export const DEFAULT_RULES: Record<string, Policy> = {
  ChatGPT: "allow",
  "GitHub Copilot": "allow",
  "Microsoft Copilot": "allow",
  TeamViewer: "allow",
  "Chrome Remote Desktop": "allow",
  MEGA: "block",
  Snapchat: "block",
  Telegram: "block",
  BitTorrent: "block",
};

/** Everything this tab edits. The page owns it so it survives a tab switch. */
export type AppAwareState = {
  policies: Record<string, Policy>;
  autoBlock: Record<string, boolean>;
  rules: Record<string, Policy>;
};

export const DEFAULT_APPAWARE_STATE: AppAwareState = {
  policies: DEFAULT_POLICIES,
  autoBlock: DEFAULT_AUTO_BLOCK,
  rules: DEFAULT_RULES,
};

/** Key order is irrelevant, so compare the maps entry by entry. */
function sameMap(a: Record<string, unknown>, b: Record<string, unknown>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if (a[k] !== b[k]) return false;
  return true;
}

/** Whether the tab has been edited away from what it shipped with. */
export function isAppAwareDirty(state: AppAwareState) {
  return (
    !sameMap(state.policies, DEFAULT_POLICIES) ||
    !sameMap(state.autoBlock, DEFAULT_AUTO_BLOCK) ||
    !sameMap(state.rules, DEFAULT_RULES)
  );
}
