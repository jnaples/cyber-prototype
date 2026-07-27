// "Set Up a Device" card shown after a clientless deployment is created.
// Platform toggle (Windows 11 / Chrome) + three labeled reference steps, with
// the deployment's endpoint URL to paste in step 2.

import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { WindowsIcon } from "@/components/icons/os-icons";
import { CollapsibleCard } from "@/components/collapsible-card";
import { MaterialSymbol } from "@/components/material-symbol";

type PlatformKey = "windows" | "chrome";

const B = ({ children }: { children: React.ReactNode }) => (
  <Box component="strong" sx={{ fontWeight: 700 }}>
    {children}
  </Box>
);

const PLATFORMS: {
  key: PlatformKey;
  label: string;
  method: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "windows",
    label: "Windows 11",
    method: "Native DNS-over-HTTPS · Windows 11 22H2 or later",
    icon: <WindowsIcon size={18} />,
  },
  {
    key: "chrome",
    label: "Chrome",
    method: "Secure DNS · Chrome 83 or later",
    icon: (
      <Box
        component="img"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/250px-Google_Chrome_icon_%28February_2022%29.svg.png"
        alt=""
        sx={{ width: 18, height: 18, display: "block" }}
      />
    ),
  },
];

type SetupStep = { label: string; body: React.ReactNode; endpoint?: boolean };

const STEPS: Record<PlatformKey, SetupStep[]> = {
  windows: [
    {
      label: "Step 1 — Open DNS settings",
      body: (
        <>
          Open <B>Settings</B> and go to <B>Network &amp; internet</B>. Select{" "}
          <B>Wi-Fi</B> (or <B>Ethernet</B>), then <B>Hardware properties</B>.
        </>
      ),
    },
    {
      label: "Step 2 — Assign the endpoint",
      body: (
        <>
          Next to <B>DNS server assignment</B>, select <B>Edit</B>. Set{" "}
          <B>DNS over HTTPS</B> to <B>On (manual template)</B> and paste the
          endpoint URL.
        </>
      ),
      endpoint: true,
    },
    {
      label: "Step 3 — Verify filtering",
      body: (
        <>
          Browse to any site, then open the <B>DNS Query Log</B>. Traffic from
          the device appears under this endpoint within a minute.
        </>
      ),
    },
  ],
  chrome: [
    {
      label: "Step 1 — Open Secure DNS",
      body: (
        <>
          Open <B>Settings</B> → <B>Privacy and security</B> → <B>Security</B>.
        </>
      ),
    },
    {
      label: "Step 2 — Assign the endpoint",
      body: (
        <>
          Turn on <B>Use secure DNS</B>, choose <B>With a custom provider</B>,
          and paste the endpoint URL.
        </>
      ),
      endpoint: true,
    },
    {
      label: "Step 3 — Verify filtering",
      body: (
        <>
          Browse to any site, then open the <B>DNS Query Log</B>. Traffic from
          the device appears under this endpoint within a minute.
        </>
      ),
    },
  ],
};

function EndpointField({ value }: { value: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        mt: 1.5,
        maxWidth: 560,
      }}
    >
      <Box
        sx={{
          flex: 1,
          px: 1.5,
          py: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.neutral",
          fontFamily: "monospace",
          fontSize: 14,
          color: "text.primary",
          wordBreak: "break-all",
        }}
      >
        {value}
      </Box>
      <ArrowTooltip title="Copy">
        <IconButton
          aria-label="Copy endpoint"
          onClick={() => navigator.clipboard?.writeText(value)}
          sx={{ color: "primary.main" }}
        >
          <MaterialSymbol name="content_copy" size={20} />
        </IconButton>
      </ArrowTooltip>
    </Box>
  );
}

export function SetUpDeviceCard({ endpoint }: { endpoint: string }) {
  const [platform, setPlatform] = useState<PlatformKey>("windows");

  return (
    <CollapsibleCard title="Set Up a Device">
      <Typography variant="body1" sx={{ color: "text.primary" }}>
        Choose a platform, then follow the system steps. No agent required.
      </Typography>

      <ToggleButtonGroup
        exclusive
        value={platform}
        onChange={(_event, value) => {
          if (value) setPlatform(value as PlatformKey);
        }}
        sx={{
          mt: 2,
          "& .MuiToggleButton-root": {
            textTransform: "none",
            gap: 1,
            px: 2,
            height: 40,
          },
        }}
      >
        {PLATFORMS.map((p) => (
          <ToggleButton key={p.key} value={p.key}>
            {p.icon}
            {p.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
        {STEPS[platform].map((step) => (
          <Box key={step.label}>
            <Typography
              variant="overline"
              sx={{ display: "block", color: "text.secondary", mb: 1 }}
            >
              {step.label}
            </Typography>
            <Typography sx={{ color: "text.primary" }}>{step.body}</Typography>
            {step.endpoint && <EndpointField value={endpoint} />}
          </Box>
        ))}
      </Box>
    </CollapsibleCard>
  );
}
