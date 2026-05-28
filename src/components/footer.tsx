import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  ButtonBase,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { FooterPopover } from "@/components/footer-popover";

interface FooterProps {
  sidebarWidth?: number;
}

// ---------------------------------------------------------------------------
// Resolver data (placeholder – replace with real data)
// ---------------------------------------------------------------------------

const resolvers = [
  { label: "IPv4 - Primary", address: "103.247.36.36" },
  { label: "IPv4 - Secondary", address: "103.247.37.37" },
  { label: "IPv6 - PRIMARY", address: "2402:5c40:5c40::3636" },
  { label: "IPv6 - SECONDARY", address: "2402:5c40:5c41::3737" },
];

// ---------------------------------------------------------------------------
// Footer component
// ---------------------------------------------------------------------------

export default function Footer({ sidebarWidth = 0 }: FooterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = (address: string, label: string) => {
    navigator.clipboard.writeText(address);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: sidebarWidth,
        right: 0,
        height: "40px",
        textAlign: "center",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        transition: "left 300ms ease-in-out",
      }}
    >
      <ButtonBase
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          borderRadius: "4px",
          px: 1,
          py: 0.5,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          DNSFilter Resolvers
        </Typography>
        <InfoOutlinedIcon
          sx={{ fontSize: 16, color: "text.secondary", ml: "6px" }}
        />
      </ButtonBase>

      <FooterPopover open={open} anchorEl={anchorEl} onClose={handleClose}>
        <Box
          sx={{
            p: 2,
            minWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            DNSFilter Resolvers
          </Typography>
          {resolvers.map((r, index) => (
            <React.Fragment key={r.label}>
              {index === 2 && <Divider sx={{ my: 1 }} />}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0,
                }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 700, textTransform: "uppercase" }}
                  >
                    {r.label}
                  </Typography>
                  <Typography variant="body2">{r.address}</Typography>
                </Box>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleCopy(r.address, r.label)}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      transition: "all 300ms ease-out",
                    }}
                  >
                    {copiedLabel === r.label ? "check" : "content_copy"}
                  </span>
                </IconButton>
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </FooterPopover>
    </Box>
  );
}
