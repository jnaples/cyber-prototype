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
  /**
   * Hand the height to the page instead of scrolling the body: the content
   * area becomes a bounded flex column, so a grid inside it can fill and
   * scroll its own rows.
   */
  fill?: boolean;
}

/**
 * Standard page scaffold for the main content area.
 *
 * Provides a height-constrained flex column (so the content area can actually
 * scroll) with a pinned header slot and a body that always carries the
 * standard 16px side / top padding and 64px bottom padding — the same whether
 * the body scrolls or the page fills. Use this for every page so scroll
 * behavior and spacing stay consistent.
 */
export function PageShell({
  header,
  maxWidth,
  fill = false,
  children,
}: PageShellProps) {
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
          overflow: fill ? "hidden" : "auto",
          // Filling or scrolling, the 64px below the content is the same.
          ...(fill ? { display: "flex", flexDirection: "column" } : {}),
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
