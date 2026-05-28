import { Container } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PageHeader } from "@/components/page-header";

export default function PageHeaderDocs() {
  return (
    <Container maxWidth="lg">
      <Stack sx={{ p: 4, gap: 6 }}>
        <Box>
          <Typography variant="pageTitle" component="h1">
            Page Header
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            The Page Header sits at the top of every page. It always shows a
            title and optionally renders a back arrow, a left slot for context
            (like an org selector), and right-aligned action buttons.
          </Typography>
        </Box>

        <Box>
          <Typography variant="sectionHeading" component="h2" sx={{ mb: 2 }}>
            Title only
          </Typography>
          <PageHeader title="Deployments" />
        </Box>

        <Box>
          <Typography variant="sectionHeading" component="h2" sx={{ mb: 2 }}>
            With actions
          </Typography>
          <PageHeader
            title="Account Settings"
            actions={
              <>
                <Button variant="outlined" color="secondary">
                  Cancel
                </Button>
                <Button variant="contained">Save</Button>
              </>
            }
          />
        </Box>

        <Box>
          <Typography variant="sectionHeading" component="h2" sx={{ mb: 2 }}>
            Sub-page with back arrow
          </Typography>
          <PageHeader
            title="Relay Deployment"
            onBack={() => alert("Back clicked")}
            actions={<Button variant="contained">Save</Button>}
          />
        </Box>

        <Box>
          <Typography variant="sectionHeading" component="h2" sx={{ mb: 2 }}>
            With left slot and actions
          </Typography>
          <PageHeader
            title="HQ West"
            onBack={() => alert("Back clicked")}
            leftSlot={
              <Typography variant="body2" color="text.secondary">
                Test Lab
              </Typography>
            }
            actions={
              <>
                <Button variant="outlined" color="secondary">
                  Cancel
                </Button>
                <Button variant="contained">Save</Button>
              </>
            }
          />
        </Box>
      </Stack>
    </Container>
  );
}
