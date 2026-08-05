import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormLabel,
  IconButton,
  Link,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
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
  { name: "Portland DC", policy: "Restricted Policy", blockPage: "Default Appearance" },
  { name: "Austin Clinic", policy: "HIPAA Strict", blockPage: "HIPAA Notice" },
  {
    name: "Lincoln Middle School",
    policy: "CIPA Policy",
    blockPage: "CIPA Notice",
  },
];

const POLICY_OPTIONS = [
  "Standard Policy",
  "Restricted Policy",
  "HIPAA Strict",
  "CIPA Policy",
  "Default Policy",
];
const GLOBAL_POLICY_OPTIONS = [
  "Global Baseline",
  "Global Threat Defense",
  "Global Compliance",
];

// Caption-style section header inside the Policy dropdown (slightly indented).
const subheaderSx = (theme: Theme) => ({
  ...theme.typography.caption,
  pl: 2,
  lineHeight: "32px",
  textTransform: "uppercase" as const,
  color: theme.vars.palette.text.secondary,
});

// Items sit more indented than their section header.
const policyItemSx = { pl: 3.5 } as const;
const BLOCK_PAGE_OPTIONS = [
  "Corporate Block Page",
  "HIPAA Notice",
  "CIPA Notice",
  "Default Appearance",
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
  // Policy / Block page default to the site's inherited values but can be
  // changed once a site is selected.
  const initialSite = SITES.find((s) => s.name === (edit.editSite ?? ""));
  const [policy, setPolicy] = useState(initialSite?.policy ?? "");
  const [blockPage, setBlockPage] = useState(initialSite?.blockPage ?? "");

  // The DoH endpoint token — only set after the user clicks "Create DoH
  // Endpoint" (or, in edit mode, seeded from the saved deployment).
  const [token, setToken] = useState<string | null>(edit.editToken ?? null);
  // True while the 1.5s "creating" spinner runs.
  const [creating, setCreating] = useState(false);

  // Changing the Site resets the endpoint so it must be re-created.
  const handleSiteChange = (next: string) => {
    setSite(next);
    const s = SITES.find((x) => x.name === next);
    setPolicy(s?.policy ?? "");
    setBlockPage(s?.blockPage ?? "");
    setToken(null);
    setCreating(false);
  };

  const handleCreateEndpoint = () => {
    setCreating(true);
    window.setTimeout(() => {
      setToken(tokenFrom(name + site));
      setCreating(false);
    }, 1500);
  };

  // Editing an existing deployment (arrived from the grid Edit action).
  const saved = Boolean(edit.editToken);
  const savedName = edit.editName ?? "";

  // Save (edit mode) is enabled only once something changes from the saved state.
  const dirty =
    name !== savedName ||
    site !== (edit.editSite ?? "") ||
    policy !== (initialSite?.policy ?? "") ||
    blockPage !== (initialSite?.blockPage ?? "");

  const back = () => navigate("/deployments/clientless");

  const createdEndpoint = token
    ? `https://doh.dnsfilter.com/${token}`
    : null;

  const handleSave = () => {
    navigate("/deployments/clientless", {
      state: {
        toast: saved
          ? "Clientless Device updated."
          : "Clientless Device created.",
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
            saved ? (
              <>
                <Button variant="outlined" color="secondary" onClick={back}>
                  Cancel
                </Button>
                <ArrowTooltip title={dirty ? "" : "No changes to save."}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      cursor: dirty ? undefined : "not-allowed",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!dirty}
                      onClick={handleSave}
                      sx={{
                        minWidth: 0,
                        pointerEvents: dirty ? undefined : "none",
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </ArrowTooltip>
              </>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleSave}
                sx={{ minWidth: 0 }}
              >
                Done
              </Button>
            )
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
                {!saved && (
                  <Box component="span" sx={{ ml: 0.25 }}>
                    *
                  </Box>
                )}
              </FormLabel>
              {saved ? (
                <Typography
                  sx={{
                    fontSize: 16,
                    color: "text.primary",
                    minHeight: 40,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {site}
                </Typography>
              ) : (
                <Select
                  fullWidth
                  displayEmpty
                  value={site}
                  onChange={(e) => handleSiteChange(e.target.value)}
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
              )}
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
                  <ArrowTooltip title={!site ? "Select a Site first." : ""}>
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        cursor: !site ? "not-allowed" : undefined,
                      }}
                    >
                      <Select
                        fullWidth
                        displayEmpty
                        disabled={!site}
                        sx={{ pointerEvents: !site ? "none" : undefined }}
                        value={policy}
                        onChange={(e) => setPolicy(e.target.value)}
                        renderValue={(v) =>
                          v ? (
                            v
                          ) : (
                            <Box component="span" sx={{ color: "text.disabled" }}>
                              -
                            </Box>
                          )
                        }
                      >
                        <ListSubheader sx={subheaderSx}>
                          Organization
                        </ListSubheader>
                        {POLICY_OPTIONS.map((p) => (
                          <MenuItem key={p} value={p} sx={policyItemSx}>
                            {p}
                          </MenuItem>
                        ))}
                        <ListSubheader sx={subheaderSx}>Global</ListSubheader>
                        {GLOBAL_POLICY_OPTIONS.map((p) => (
                          <MenuItem key={p} value={p} sx={policyItemSx}>
                            {p}
                            <MaterialSymbol
                              name="globe"
                              size={16}
                              sx={{ ml: 0.75, color: "text.secondary" }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </ArrowTooltip>
                </Box>
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>
                    Block Page
                  </FormLabel>
                  <ArrowTooltip title={!site ? "Select a Site first." : ""}>
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        cursor: !site ? "not-allowed" : undefined,
                      }}
                    >
                      <Select
                        fullWidth
                        displayEmpty
                        disabled={!site}
                        sx={{ pointerEvents: !site ? "none" : undefined }}
                        value={blockPage}
                        onChange={(e) => setBlockPage(e.target.value)}
                        renderValue={(v) =>
                          v ? (
                            v
                          ) : (
                            <Box component="span" sx={{ color: "text.disabled" }}>
                              Default Appearance
                            </Box>
                          )
                        }
                      >
                        {BLOCK_PAGE_OPTIONS.map((b) => (
                          <MenuItem key={b} value={b}>
                            {b}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </ArrowTooltip>
                </Box>
              </Box>
              {!saved && (
                <Box
                  sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}
                >
                  <ArrowTooltip title={!site ? "Select a Site first." : ""}>
                    <Box
                      component="span"
                      sx={{
                        alignSelf: "flex-start",
                        display: "inline-flex",
                        cursor:
                          !site || creating || token
                            ? "not-allowed"
                            : undefined,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        disabled={!site || creating || Boolean(token)}
                        onClick={handleCreateEndpoint}
                        startIcon={
                          creating ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : token ? (
                            <MaterialSymbol name="check" size={18} />
                          ) : undefined
                        }
                        sx={{
                          pointerEvents:
                            !site || creating || token ? "none" : undefined,
                        }}
                      >
                        {creating
                          ? "Creating"
                          : token
                            ? "Created"
                            : "Create DoH Endpoint"}
                      </Button>
                    </Box>
                  </ArrowTooltip>
                  {token && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={(theme) => ({
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.5,
                          py: 1,
                          borderRadius: 1,
                          bgcolor: theme.vars.palette.Alert.successStandardBg,
                          color: theme.vars.palette.Alert.successColor,
                        })}
                      >
                        <MaterialSymbol name="check_circle" size={20} />
                        <Typography variant="body2">
                          Success: Clientless Device created.
                        </Typography>
                      </Box>
                      <Box />
                    </Box>
                  )}
                </Box>
              )}
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
                disabled={!saved}
                value={createdEndpoint ?? ""}
                placeholder="Not yet created"
                slotProps={{ input: { readOnly: saved } }}
                sx={{
                  "& .MuiOutlinedInput-root": { bgcolor: "background.neutral" },
                  "& .MuiOutlinedInput-input": {
                    fontFamily: createdEndpoint ? "monospace" : undefined,
                  },
                  "& .MuiOutlinedInput-input.Mui-disabled": {
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
                <CopyButton value={createdEndpoint} label="Copy DoH endpoint" />
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
            {createdEndpoint && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5 }}
              >
                Point devices at this URL to filter DNS through the Site&apos;s
                policy.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </PageShell>
  );
}
