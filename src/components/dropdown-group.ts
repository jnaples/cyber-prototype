// Shared shape for a dropdown that groups its options under headings.
//
// Headings keep the list's own 16px inset; their options step in from it, so
// the grouping reads at a glance. Every grouped dropdown in the app uses these
// — the policy picker, the searchable selects, and anything added later.

import type { Theme } from "@mui/material/styles";

/** Indentation for an option sitting under a group heading. */
export const GROUPED_ITEM_SX = { pl: 3.5 } as const;

/** The heading itself: the app's overline, flush with the list's inset. */
export const GROUP_HEADING_SX = (theme: Theme) => ({
  ...theme.typography.overline,
  pl: 2,
  lineHeight: 1.5,
  pt: 1,
  color: theme.vars.palette.text.secondary,
  // Static so a long list doesn't pin headings over the options.
  position: "static" as const,
});
