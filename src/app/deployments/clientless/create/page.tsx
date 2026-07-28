import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormLabel,
  IconButton,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { CopyButton } from "@/components/copy-button";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";

// Sites the deployment can inherit policy / schedule / block page from.
const SITES = [
  { name: "Seattle HQ", policy: "Standard Policy", blockPage: "Corporate Block Page" },
  { name: "Portland DC", policy: "Restricted Policy", blockPage: "(Default)" },
  { name: "Austin Clinic", policy: "HIPAA Strict", blockPage: "HIPAA Notice" },
  {
    name: "Lincoln Middle School",
    policy: "CIPA Policy",
    blockPage: "CIPA Notice",
  },
];

// Deterministic 6-char token derived from the deployment's name + site.
function tokenFrom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(6, "0").slice(0, 6);
}

function StepOverline({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{ display: "block", color: "text.secondary" }}
    >
      {children}
    </Typography>
  );
}

// Read-only, Site-inherited field: filled neutral box with a muted placeholder.
function ReadonlyField({
  value,
  placeholder,
}: {
  value: string;
  placeholder: string;
}) {
  return (
    <TextField
      fullWidth
      disabled
      value={value}
      placeholder={placeholder}
      sx={{
        "& .MuiOutlinedInput-root": { bgcolor: "background.neutral" },
        // Keep the inherited value readable even though the field is disabled.
        "& .MuiOutlinedInput-input.Mui-disabled": {
          WebkitTextFillColor: value
            ? "var(--dnsf-palette-text-primary)"
            : undefined,
        },
        "& .MuiOutlinedInput-input::placeholder": {
          color: "text.disabled",
          opacity: 1,
        },
      }}
    />
  );
}

export default function CreateClientlessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // When opened via a grid Edit action, the row's data arrives as router state
  // so the page loads in its already-created (editable) form.
  const edit = (location.state ?? {}) as {
    editName?: string;
    editSite?: string;
    editToken?: string;
  };

  const [name, setName] = useState(edit.editName ?? "");
  const [site, setSite] = useState(edit.editSite ?? "");
  // The generated DoH endpoint token — set once the form first becomes valid.
  const [token, setToken] = useState<string | null>(edit.editToken ?? null);
  // Whether the user has copied the generated endpoint (required to save).
  const [hasCopied, setHasCopied] = useState(Boolean(edit.editToken));

  // Editing an existing deployment (arrived from the grid Edit action).
  const saved = Boolean(edit.editToken);
  const savedName = edit.editName ?? "";
  const savedSite = edit.editSite ?? "";

  const back = () => navigate("/deployments/clientless");
  const selectedSite = SITES.find((s) => s.name === site);
  const valid = name.trim() !== "" && site !== "";

  // Generate the endpoint token the first time the form becomes valid.
  if (valid && token === null) setToken(tokenFrom(name + site));

  const createdEndpoint =
    valid && token ? `https://doh.dnsfilter.com/${token}` : null;

  const dirty = saved && (name !== savedName || site !== savedSite);
  // Save unlocks once required fields are filled and the endpoint is copied;
  // after the first save it re-enables only when there are unsaved edits.
  const canSave = valid && ((!saved && hasCopied) || (saved && dirty));

  const handleSave = () => {
    navigate("/deployments/clientless", {
      state: {
        toast: saved
          ? "Clientless deployment updated."
          : "Clientless deployment created.",
      },
    });
  };

  return (
    <PageShell
      maxWidth="lg"
      header={
        <PageHeader
          title={saved ? savedName : "Add Clientless Device"}
          onBack={back}
          actions={
            <>
              <Button variant="outlined" color="secondary" onClick={back}>
                Cancel
              </Button>
              <ArrowTooltip
                title={
                  !valid
                    ? "Enter a name and select a Site, then copy the DoH endpoint to enable Save."
                    : !saved && !hasCopied
                      ? "Copy the DoH endpoint to enable Save."
                      : saved && !dirty
                        ? "No changes to save."
                        : ""
                }
              >
                <Box
                  component="span"
                  sx={{ cursor: canSave ? undefined : "not-allowed" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!canSave}
                    onClick={handleSave}
                    sx={{ minWidth: 0 }}
                  >
                    Save
                  </Button>
                </Box>
              </ArrowTooltip>
            </>
          }
        />
      }
    >
      <Card>
        <CardContent
          sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Intro */}
          <Box>
            <Typography variant="cardTitle">
              Set Up Clientless DNS Filtering
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.primary", mt: 1, maxWidth: "65ch" }}
            >
              Filter DNS on devices where a Roaming Client can&apos;t be
              installed. Each deployment creates a DoH endpoint URL that applies
              the assigned filtering policy.
            </Typography>
            <Link
              href="#"
              underline="hover"
              sx={(theme) => ({
                display: "inline-block",
                fontWeight: 600,
                ...theme.applyStyles("dark", {
                  color: theme.vars.palette.primary.light,
                }),
              })}
            >
              View step-by-step Clientless setup instructions
            </Link>
          </Box>

          {/* Step 1 — Name */}
          <Box>
            <StepOverline>Step 1 - Name Deployment</StepOverline>
            <FormLabel sx={{ display: "block", mb: 0.5 }}>
              Name
              <Box component="span" sx={{ ml: 0.25 }}>
                *
              </Box>
            </FormLabel>
            <TextField
              fullWidth
              placeholder="e.g. Lobby Kiosks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root:not(.Mui-disabled) input::placeholder":
                  {
                    color: "text.disabled",
                    opacity: 1,
                  },
              }}
            />
          </Box>

          <Divider sx={{ mt: 1 }} />

          {/* Step 2 — Site & policy */}
          <Box>
            <StepOverline>Step 2 - Assign Site &amp; Policy</StepOverline>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <FormLabel sx={{ display: "block", mb: 0.5 }}>
                Site
                <Box component="span" sx={{ ml: 0.25 }}>
                  *
                </Box>
              </FormLabel>
              <Select
                fullWidth
                displayEmpty
                value={site}
                onChange={(e) => setSite(e.target.value)}
                renderValue={(value) =>
                  value ? (
                    value
                  ) : (
                    <Box component="span" sx={{ color: "text.disabled" }}>
                      Select a Site
                    </Box>
                  )
                }
              >
                {SITES.map((s) => (
                  <MenuItem key={s.name} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>
                    Policy/Schedule
                  </FormLabel>
                  <ReadonlyField
                    value={selectedSite?.policy ?? ""}
                    placeholder="-"
                  />
                </Box>
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>
                    Block Page
                  </FormLabel>
                  <ReadonlyField
                    value={selectedSite?.blockPage ?? ""}
                    placeholder="-"
                  />
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5 }}
              >
                Inherited from the Site. Update the Site to change them.
              </Typography>
            </Box>
            </Box>
          </Box>

          <Divider sx={{ mt: 1 }} />

          {/* Step 3 — DoH endpoint */}
          <Box>
            <StepOverline>Step 3 - Copy DoH Endpoint</StepOverline>
            <FormLabel sx={{ display: "block", mb: 0.5 }}>
              DoH Endpoint
            </FormLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TextField
                fullWidth
                disabled
                value={createdEndpoint ?? ""}
                placeholder="Select a site to generate key"
                sx={{
                  "& .MuiOutlinedInput-root": { bgcolor: "background.neutral" },
                  "& .MuiOutlinedInput-input.Mui-disabled": {
                    fontFamily: createdEndpoint ? "monospace" : undefined,
                    WebkitTextFillColor: createdEndpoint
                      ? "var(--dnsf-palette-text-primary)"
                      : undefined,
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "text.disabled",
                    opacity: 1,
                  },
                }}
              />
              {createdEndpoint ? (
                <CopyButton
                  value={createdEndpoint}
                  label="Copy DoH endpoint"
                  onCopy={() => setHasCopied(true)}
                />
              ) : (
                <IconButton
                  disabled
                  aria-label="Copy DoH endpoint"
                  sx={{ color: "primary.main" }}
                >
                  <MaterialSymbol name="content_copy" size={20} />
                </IconButton>
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {createdEndpoint
                ? "Point devices at this URL to filter DNS through the Site's policy."
                : "Generates when a name is entered and a Site is selected."}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </PageShell>
  );
}
