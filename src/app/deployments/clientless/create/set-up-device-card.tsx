// "Set up a device" card shown after a clientless deployment is created.
// Platform toggle + a vertical MUI Stepper rendered with every step active and
// expanded at once (a reference guide, not an interactive wizard).

import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import {
  AndroidIcon,
  MacIcon,
  WindowsIcon,
} from "@/components/icons/os-icons";
import { CollapsibleCard } from "@/components/collapsible-card";
import { MaterialSymbol } from "@/components/material-symbol";

type PlatformKey = "windows" | "apple" | "android" | "chrome";

type SetupStep = {
  title: string;
  lines: string[];
  showDevicePicker?: boolean;
  endpoint?: { label: string; value: string };
};

function buildSteps(
  platform: PlatformKey,
  id: string,
  device: string,
): SetupStep[] {
  const doh = `https://doh.dnsfilter.com/${id}${device ? `/${device}` : ""}`;
  const dot = `${device ? `${device}.` : ""}${id}.dns.dnsfilter.com`;

  switch (platform) {
    case "apple":
      return [
        {
          title: "Download the profile",
          lines: [
            "Download the DNSFilter configuration profile to your device.",
          ],
        },
        {
          title: "Install the profile",
          lines: [
            "Open Settings — a 'Profile Downloaded' prompt appears — and tap Install.",
            "Enter your passcode to confirm.",
          ],
        },
        {
          title: "Verify the endpoint",
          lines: [
            "Confirm the profile appears under Settings → General → VPN & Device Management.",
          ],
          showDevicePicker: true,
          endpoint: { label: "DNS-over-HTTPS", value: doh },
        },
      ];
    case "android":
      return [
        {
          title: "Open Private DNS settings",
          lines: ["Open Settings → Network & internet → Private DNS."],
        },
        {
          title: "Choose provider hostname",
          lines: ["Select 'Private DNS provider hostname'."],
        },
        {
          title: "Enter the hostname",
          lines: [
            "Enter the DNS-over-TLS hostname below, then tap Save.",
          ],
          showDevicePicker: true,
          endpoint: { label: "DNS-over-TLS/QUIC", value: dot },
        },
      ];
    case "chrome":
      return [
        {
          title: "Open Chrome settings",
          lines: ["Go to Settings → Privacy and security → Security."],
        },
        {
          title: "Enable Secure DNS",
          lines: [
            "Turn on 'Use secure DNS' and choose 'With a custom provider'.",
          ],
        },
        {
          title: "Enter the DoH URL",
          lines: ["Paste the DNS-over-HTTPS URL below."],
          showDevicePicker: true,
          endpoint: { label: "DNS-over-HTTPS", value: doh },
        },
      ];
    case "windows":
    default:
      return [
        {
          title: "Open DNS settings",
          lines: [
            "Open the Settings app and go to Network & internet.",
            "Click on Wi-Fi (or Ethernet).",
            "Click on Hardware properties (ignore this step if you clicked on Ethernet).",
            "Click the Edit button next to DNS server assignment.",
          ],
        },
        {
          title: "Switch to manual",
          lines: ["Select Manual, then enable IPv4."],
        },
        {
          title: "Set the Preferred DNS",
          lines: [
            "Enter 45.90.28.0 as Preferred DNS, then select On (manual template) and enter the DoH URL below.",
          ],
          showDevicePicker: true,
          endpoint: { label: "DNS-over-HTTPS", value: doh },
        },
        {
          title: "Set the Alternate DNS",
          lines: [
            "Enter 45.90.30.0 as Alternate DNS, then select On (manual template) and enter the DoH URL below.",
          ],
          endpoint: { label: "DNS-over-HTTPS", value: doh },
        },
        {
          title: "Save",
          lines: ["Click Save. Encrypted DNS now applies to this adapter."],
        },
      ];
  }
}

const PLATFORMS: {
  key: PlatformKey;
  label: string;
  method: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "windows",
    label: "Windows 11",
    method: "Native DNS-over-HTTPS (Windows 11 22H2+)",
    icon: <WindowsIcon size={18} />,
  },
  {
    key: "apple",
    label: "macOS / iOS / iPadOS",
    method: "Configuration profile",
    icon: <MacIcon size={18} />,
  },
  {
    key: "android",
    label: "Android 9+",
    method: "Private DNS (DNS-over-TLS)",
    icon: <AndroidIcon size={18} />,
  },
  {
    key: "chrome",
    label: "Chrome",
    method: "Secure DNS (DNS-over-HTTPS)",
    icon: <MaterialSymbol name="public" size={18} sx={{ color: "#4285F4" }} />,
  },
];

function EndpointRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          size="small"
          value={value}
          slotProps={{ input: { readOnly: true } }}
          sx={{ width: "100%", maxWidth: 480 }}
        />
        <ArrowTooltip title="Copy">
          <IconButton
            size="small"
            aria-label={`Copy ${label}`}
            onClick={() => navigator.clipboard?.writeText(value)}
          >
            <MaterialSymbol
              name="content_copy"
              size={18}
              sx={{ color: "text.secondary" }}
            />
          </IconButton>
        </ArrowTooltip>
      </Box>
    </Box>
  );
}

export function SetUpDeviceCard({
  deploymentId,
  devices,
}: {
  deploymentId: string;
  devices: string[];
}) {
  const [platform, setPlatform] = useState<PlatformKey>("windows");
  const [device, setDevice] = useState("");

  const active = PLATFORMS.find((p) => p.key === platform) ?? PLATFORMS[0];
  const steps = buildSteps(platform, deploymentId, device);

  return (
    <CollapsibleCard title="Set up a device">
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Choose a platform, then follow the standard system steps — no app
        required.
      </Typography>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={platform}
        onChange={(_event, value) => {
          if (value) setPlatform(value as PlatformKey);
        }}
        sx={{
          mt: 2,
          flexWrap: "wrap",
          "& .MuiToggleButton-root": {
            textTransform: "none",
            gap: 1,
            px: 1.5,
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

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mt: 2, mb: 1 }}
      >
        {active.method}
      </Typography>

      <Stepper orientation="vertical">
        {steps.map((step) => (
          <Step key={step.title} active expanded>
            <StepLabel>{step.title}</StepLabel>
            <StepContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {step.lines.map((line) => (
                  <Typography
                    key={line}
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                  >
                    {line}
                  </Typography>
                ))}
              </Box>

              {step.showDevicePicker && (
                <Box sx={{ mt: 1.5 }}>
                  <FormControl size="small" sx={{ width: "100%", maxWidth: 320 }}>
                    <Select
                      displayEmpty
                      value={device}
                      onChange={(e) => setDevice(e.target.value)}
                      renderValue={(value) =>
                        value ? (
                          value
                        ) : (
                          <Box component="span" sx={{ color: "text.secondary" }}>
                            Device (optional)
                          </Box>
                        )
                      }
                    >
                      <MenuItem value="">None</MenuItem>
                      {devices.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", mt: 0.5 }}
                  >
                    Pick a registered device to use its personalized endpoint
                    below, or add devices in the Devices section.
                  </Typography>
                </Box>
              )}

              {step.endpoint && (
                <EndpointRow
                  label={step.endpoint.label}
                  value={step.endpoint.value}
                />
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </CollapsibleCard>
  );
}
