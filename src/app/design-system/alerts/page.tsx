import {
  Alert,
  AlertTitle,
  Box,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

const SEVERITIES = [
  { severity: "success", label: "Success" },
  { severity: "info", label: "Info" },
  { severity: "warning", label: "Warning" },
  { severity: "error", label: "Error" },
];

const VARIANTS = [
  { variant: "standard", label: "Standard" },
  { variant: "filled", label: "Filled" },
  { variant: "outlined", label: "Outlined" },
];

export default function AlertView() {
  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Typography variant="h3">Alert Variants</Typography>

        {/* All Variants Grid */}
        <Box>
          <Typography variant="h5" gutterBottom>
            All Alert Variants
          </Typography>
          <Stack spacing={3}>
            {VARIANTS.map((variant) => (
              <Box key={variant.variant}>
                <Typography variant="h6" gutterBottom>
                  {variant.label} Variant
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  useFlexGap
                  sx={{ flexWrap: "wrap" }}
                >
                  {SEVERITIES.map((sev) => (
                    <Alert
                      key={sev.severity}
                      severity={
                        sev.severity as "success" | "info" | "warning" | "error"
                      }
                      variant={
                        variant.variant as "standard" | "filled" | "outlined"
                      }
                      sx={{ minWidth: 260 }}
                    >
                      <AlertTitle>{sev.label}</AlertTitle>
                      This is a {variant.label.toLowerCase()}{" "}
                      {sev.label.toLowerCase()} alert.
                    </Alert>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Individual Variant Sections */}
        {VARIANTS.map((variant) => (
          <Box key={variant.variant}>
            <Typography variant="h5" gutterBottom>
              {variant.label} Alerts
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              {SEVERITIES.map((sev) => (
                <Alert
                  key={sev.severity}
                  severity={
                    sev.severity as "success" | "info" | "warning" | "error"
                  }
                  variant={
                    variant.variant as "standard" | "filled" | "outlined"
                  }
                  sx={{ minWidth: 260 }}
                >
                  <AlertTitle>{sev.label}</AlertTitle>
                  This is a {variant.label.toLowerCase()}{" "}
                  {sev.label.toLowerCase()} alert.
                </Alert>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
