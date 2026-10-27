// SSL Certificate — the root CAs a browser needs before it will show a block
// page on an HTTPS site.
//
// Two certificates are listed while the root is being rotated: the one in use
// today and the one that replaces it. Both have to be installed for the
// cutover to pass without a certificate error, which is what the banner says.

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { MaterialSymbol } from "@/components/material-symbol";

/** The roots on offer, in the order they take over. */
const CERTIFICATES = [
  { name: "DNSFilter Root CA", status: "Current" as const },
  { name: "DNSFilter Root CA G1", status: "New" as const },
];

/** The replacement is called out; the one in use reads as ordinary. */
const newChipSx = (theme: Theme) => ({
  bgcolor: theme.vars.palette.Alert.infoStandardBg,
  color: theme.vars.palette.Alert.infoColor,
  "& .MuiChip-label": { color: "inherit" },
});

export default function SslCertificatePage() {
  return (
    <Card>
      <CardHeader title="Block page certificates" />
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ color: "text.secondary" }}>
            <Typography variant="body2" sx={{ color: "inherit" }}>
              Blocked HTTPS sites show the block page only when both
              certificates below are installed.
            </Typography>
            <Typography variant="body2" sx={{ color: "inherit" }}>
              Without them, browsers show a certificate error instead.
            </Typography>
          </Box>

          <Alert severity="info">
            DNSFilter is rotating to a new root certificate. Install both
            certificates now so block pages keep working after the cutover.
          </Alert>

          <Box>
            {CERTIFICATES.map((certificate) => (
              <Box key={certificate.name}>
                <Divider />
                <Box
                  sx={{
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {certificate.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={certificate.status}
                      sx={certificate.status === "New" ? newChipSx : undefined}
                    />
                  </Stack>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<MaterialSymbol name="download" size={18} />}
                    sx={{ flexShrink: 0 }}
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            ))}
            <Divider />
          </Box>

          <Box>
            <Link component="button" type="button" underline="hover">
              Install Root CA certificates
            </Link>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
