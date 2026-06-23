import { Box, Container } from "@mui/material";
import type { ContainerProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface PageShellProps {
  /** Page header (e.g. <PageHeader />), pinned above the scroll area. */
  header?: React.ReactNode;
  /**
   * When set, the scrollable content is wrapped in an MUI Container of this
   * maxWidth. Omit for full-bleed content (e.g. data tables).
   */
  maxWidth?: ContainerProps["maxWidth"];
  children: React.ReactNode;
}

/**
 * Standard page scaffold for the main content area.
 *
 * Provides a height-constrained flex column (so the content area can actually
 * scroll) with a pinned header slot and a scrollable body that always carries
 * the standard 16px side / top padding and 64px bottom padding. Use this for
 * every page so scroll behavior and spacing stay consistent.
 */
export function PageShell({ header, maxWidth, children }: PageShellProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {header}
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 8,
          minWidth: 0,
          minHeight: 0,
          flex: 1,
          maxWidth: "100%",
          overflow: "auto",
          color: (
            theme: Theme & {
              vars?: { palette?: { text?: { primary?: string } } };
            },
          ) => theme.vars?.palette?.text?.primary ?? theme.palette.text.primary,
        }}
      >
        {maxWidth ? (
          <Container maxWidth={maxWidth}>{children}</Container>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}
