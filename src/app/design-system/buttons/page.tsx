import { Box, Container } from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function ButtonDocs() {
  return (
    <Container maxWidth="lg">
      <Stack sx={{ p: 4, gap: 4 }}>
        <Box>
          <Typography variant="pageTitle" component="h1">
            Button
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Buttons trigger actions across the application.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary">
            Primary
          </Button>

          <Button variant="outlined" color="secondary">
            Secondary
          </Button>

          <Button variant="contained" color="secondary">
            Tertiarty
          </Button>

          <Button variant="text" color="primary">
            Text
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
