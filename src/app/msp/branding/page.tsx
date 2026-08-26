// MSP → Branding. White-label settings: the dashboard name and URL customers
// see, the logo and favicon that replace DNSFilter's, and which domain their
// email comes from.

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  FormControlLabel,
  FormLabel,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Snackbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { TextField } from "@/components/text-field";

const EMAIL_TEMPLATES: {
  value: string;
  label: string;
  helper: string;
  /** Trailing link after the helper copy. */
  linkLabel?: string;
}[] = [
  {
    value: "dnsfilter",
    label: "Send emails from @dnsfilter.com",
    helper: "Emails include DNSFilter branding.",
  },
  {
    value: "netalerts",
    label: "Send emails from @netalerts.io",
    helper: "Emails do not include DNSFilter branding.",
  },
  {
    value: "custom",
    label: "Use a custom email domain",
    helper: "Send transactional emails from a branded company domain.",
    linkLabel: "Set up a custom email domain",
  },
];

const DEFAULT_EMAIL_TEMPLATE = EMAIL_TEMPLATES[0].value;

/** How long a dashboard name may be before the field errors. */
const NAME_LIMIT = 40;

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Label with the explanation on an info icon, as in the DoH Endpoint drawer. */
function FieldLabel({
  label,
  help,
  required,
  optional,
}: {
  label: string;
  help?: string;
  required?: boolean;
  /** Marks the field as optional, opposite the label. */
  optional?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
      <FormLabel sx={{ display: "block", mb: 0 }}>
        {label}
        {required && (
          <Box component="span" sx={{ ml: 0.25 }}>
            *
          </Box>
        )}
      </FormLabel>
      {help && (
        <ArrowTooltip title={help}>
          <InfoOutlinedIcon
            sx={(theme) => ({
              fontSize: 16,
              cursor: "help",
              color: "primary.main",
              ...theme.applyStyles("dark", {
                color: theme.vars.palette.primary.light,
              }),
            })}
          />
        </ArrowTooltip>
      )}
      {optional && (
        <Typography
          variant="body2"
          sx={{ ml: "auto", color: "text.secondary" }}
        >
          Optional
        </Typography>
      )}
    </Box>
  );
}

/** Collapsible card, matching the Add Clientless Device form. */
function SectionCard({
  title,
  children,
  sx,
}: {
  title: string;
  children: React.ReactNode;
  sx?: object;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Card sx={sx}>
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="cardTitle">{title}</Typography>
          <IconButton
            size="small"
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => setOpen((o) => !o)}
          >
            <MaterialSymbol
              name={open ? "expand_less" : "expand_more"}
              size={20}
            />
          </IconButton>
        </Box>
        <Collapse in={open}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            {children}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

/**
 * Upload well. Picking a file previews it in place via an object URL, which
 * lives only for the session — a refresh clears it, since nothing is uploaded.
 */
function ImageDrop({
  previewHeight,
  alt,
  src,
  onChange,
}: {
  /** How tall the preview may render inside the well. */
  previewHeight: number;
  alt: string;
  src: string | null;
  onChange: (src: string | null) => void;
}) {
  const pick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (src) URL.revokeObjectURL(src);
    onChange(URL.createObjectURL(file));
    // Reset so re-picking the same file still fires a change.
    event.target.value = "";
  };

  const clear = () => {
    if (src) URL.revokeObjectURL(src);
    onChange(null);
  };

  return (
    <Box>
      {/* A label makes the whole well open the file dialog, keyboard included. */}
      <Box
        component="label"
        sx={(theme) => ({
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.neutral",
          minHeight: previewHeight + 32,
          p: 2,
          textAlign: "center",
          cursor: "pointer",
          color: "text.primary",
          "&:hover": { borderColor: "primary.main" },
          // Full-strength primary is too dark against the dark scheme.
          ...theme.applyStyles("dark", {
            "&:hover": { borderColor: theme.vars.palette.primary.light },
          }),
        })}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={pick}
          style={{ display: "none" }}
        />
        {src ? (
          <Box
            component="img"
            src={src}
            alt={alt}
            sx={{
              maxHeight: previewHeight,
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <Typography variant="body1">Choose an image</Typography>
        )}
        {src && (
          <ArrowTooltip title="Remove image">
            <IconButton
              size="small"
              aria-label={`Remove ${alt}`}
              // The well is a label, so a click here would otherwise reopen
              // the file dialog.
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                clear();
              }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "error.main",
              }}
            >
              <MaterialSymbol name="delete_forever" size={20} />
            </IconButton>
          </ArrowTooltip>
        )}
      </Box>
    </Box>
  );
}

export default function BrandingPage() {
  const [dashboardName, setDashboardName] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [darkLogo, setDarkLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  // What the form looked like when it was last saved.
  const [saved, setSaved] = useState({
    dashboardName: "",
    dashboardUrl: "",
    contactEmail: "",
    emailTemplate: DEFAULT_EMAIL_TEMPLATE,
    logo: null as string | null,
    darkLogo: null as string | null,
    favicon: null as string | null,
  });
  const [emailTemplate, setEmailTemplate] = useState<string>(
    DEFAULT_EMAIL_TEMPLATE,
  );

  const [toast, setToast] = useState(false);

  // Nothing to navigate back to, so saving just confirms in place and resets
  // the dirty baseline.
  const handleSave = () => {
    setSaved({
      dashboardName,
      dashboardUrl,
      contactEmail,
      emailTemplate,
      logo,
      darkLogo,
      favicon,
    });
    setToast(true);
  };

  // Flagged once the field has content but isn't a valid address — typing
  // shouldn't turn red on the first character.
  const emailError =
    contactEmail.trim() !== "" && !isEmail(contactEmail.trim())
      ? "Enter a valid email address."
      : "";

  const nameTooLong = dashboardName.length > NAME_LIMIT;

  // The contact email is optional, but it still has to be a valid address if
  // one is given.
  const missingRequired =
    dashboardName.trim() === "" || nameTooLong || Boolean(emailError);

  // Save only lights up once something differs from the saved state.
  const dirty =
    dashboardName !== saved.dashboardName ||
    dashboardUrl !== saved.dashboardUrl ||
    contactEmail !== saved.contactEmail ||
    emailTemplate !== saved.emailTemplate ||
    logo !== saved.logo ||
    darkLogo !== saved.darkLogo ||
    favicon !== saved.favicon;

  const canSave = dirty && !missingRequired;

  return (
    <PageShell
      maxWidth="lg"
      header={
        <PageHeader
          title="Branding"
          actions={
            <>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setDashboardName(saved.dashboardName);
                  setDashboardUrl(saved.dashboardUrl);
                  setContactEmail(saved.contactEmail);
                  setEmailTemplate(saved.emailTemplate);
                  setLogo(saved.logo);
                  setDarkLogo(saved.darkLogo);
                  setFavicon(saved.favicon);
                }}
              >
                Cancel
              </Button>
              <ArrowTooltip
                title={
                  nameTooLong
                    ? `Dashboard Name is limited to ${NAME_LIMIT} characters.`
                    : emailError
                      ? emailError
                      : missingRequired
                        ? "Fill in the required fields first."
                        : dirty
                          ? ""
                          : "No changes to save."
                }
              >
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    cursor: canSave ? undefined : "not-allowed",
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!canSave}
                    onClick={handleSave}
                    sx={{ pointerEvents: canSave ? undefined : "none" }}
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
      <SectionCard title="Dashboard Customization">
        <Box>
          <FieldLabel
            label="Dashboard Name"
            help='Sets the browser tab title and login screen text "Service provided by {Dashboard Name}".'
            required
          />
          <TextField
            fullWidth
            placeholder="e.g., Security Portal"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            error={nameTooLong}
            // MUI indents contained helper text on both sides; dropping the
            // right inset puts the count flush with the field's edge.
            sx={{ "& .MuiFormHelperText-root": { mr: 0 } }}
            // Typing past the limit isn't blocked — the field goes red and the
            // count says by how much.
            helperText={
              <Box
                component="span"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <span>{`${NAME_LIMIT} character limit`}</span>
                <span>{`${dashboardName.length}/${NAME_LIMIT}`}</span>
              </Box>
            }
          />
        </Box>

        <Box>
          <FieldLabel
            label="Custom Dashboard URL"
            help="Brands the dashboard and login page with a custom domain."
          />
          <TextField
            fullWidth
            placeholder="yourcompanyname.app.dnsfilter.com"
            value={dashboardUrl}
            onChange={(e) => setDashboardUrl(e.target.value)}
          />
        </Box>

        {/* The two logos side by side, so light and dark read as one choice. */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 2,
          }}
        >
          <Box>
            <FieldLabel
              label="Default Logo (max width: 500px)"
              help="Displayed across the dashboard, emails, and block pages. Organizations can set a different logo on block pages."
            />
            <ImageDrop
              previewHeight={72}
              alt="Default logo preview"
              src={logo}
              onChange={setLogo}
            />
          </Box>
          <Box>
            <FieldLabel
              label="Dark Mode Logo (max width: 500px)"
              optional
              help="Used on the side navigation and in dark mode. Helpful when a logo needs more contrast to stay visible, such as one with dark or low-contrast colors."
            />
            <ImageDrop
              previewHeight={72}
              alt="Dark mode logo preview"
              src={darkLogo}
              onChange={setDarkLogo}
            />
          </Box>
        </Box>

        {/* Favicon keeps the left column; the right one is deliberately empty. */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 2,
          }}
        >
          <Box>
            <FieldLabel
              label="Custom Favicon (max width: 32px)"
              help="Shown in the browser tab on the dashboard and other branded pages."
            />
            <ImageDrop
              previewHeight={32}
              alt="Custom favicon preview"
              src={favicon}
              onChange={setFavicon}
            />
          </Box>
          <Box />
        </Box>
      </SectionCard>

      <SectionCard title="Email Configuration" sx={{ mt: 2 }}>
        <Box>
          <FieldLabel
            label="Customer Contact Email"
            help="Shown to organizations on the account-cancellation login error, as the contact for assistance."
          />
          <TextField
            fullWidth
            placeholder="e.g., support@yourcompany.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            error={Boolean(emailError)}
            helperText={emailError}
          />
        </Box>

        <Box>
          <FormLabel sx={{ display: "block" }}>Email Template</FormLabel>
          <RadioGroup
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
          >
            {EMAIL_TEMPLATES.map((t) => (
              <Box key={t.value} sx={{ mb: 1 }}>
                <FormControlLabel
                  value={t.value}
                  // Same 20px glyph the Report Library's radios use.
                  control={
                    <Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }} />
                  }
                  label={t.label}
                />
                {/* Indented to the label, clear of the radio. */}
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", ml: "26px", mt: "-4px" }}
                >
                  {t.helper}
                  {t.linkLabel && (
                    <>
                      {" "}
                      <Link href="#" underline="hover">
                        {t.linkLabel}
                      </Link>
                    </>
                  )}
                </Typography>
              </Box>
            ))}
          </RadioGroup>
        </Box>
      </SectionCard>

      <Snackbar
        open={toast}
        autoHideDuration={2000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="standard"
          elevation={8}
          onClose={() => setToast(false)}
          sx={{
            alignItems: "center",
            "& .MuiAlert-icon": { alignSelf: "center", py: 0 },
            "& .MuiAlert-message": { py: 0 },
          }}
        >
          Branding settings saved.
        </Alert>
      </Snackbar>
    </PageShell>
  );
}
