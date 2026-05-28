import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  onBack?: () => void;
  leftSlot?: ReactNode;
  actions?: ReactNode;
  // Optional content rendered below the title row, inside the same shadowed
  // surface — e.g. a filter bar that should visually belong to the header.
  children?: ReactNode;
};

export function PageHeader({
  title,
  onBack,
  leftSlot,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        py: 2,
        px: 3,
        width: "100%",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Stack
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        {/* Title row — back arrow + title + desktop-only left slot */}
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
            flex: 1,
          }}
        >
          {onBack && (
            <IconButton onClick={onBack} aria-label="Go back" size="small">
              <ChevronLeftIcon />
            </IconButton>
          )}

          <Typography variant="pageTitle" component="h1" noWrap>
            {title}
          </Typography>

          {leftSlot && (
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                display: { xs: "none", sm: "flex" },
              }}
            >
              {leftSlot}
            </Stack>
          )}
        </Stack>

        {/* Mobile-only left slot — renders between title row and actions */}
        {leftSlot && (
          <Box sx={{ display: { xs: "block", sm: "none" }, width: "100%" }}>
            {leftSlot}
          </Box>
        )}

        {/* Actions — always last */}
        {actions && (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "stretch", sm: "flex-end" },
              "& > button": {
                flex: { xs: 1, sm: "unset" },
              },
            }}
          >
            {actions}
          </Stack>
        )}
      </Stack>

      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Box>
  );
}
