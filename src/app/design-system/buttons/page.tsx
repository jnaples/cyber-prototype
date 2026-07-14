import { Container } from "@mui/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function ButtonDocs() {
  return (
    <Container maxWidth="lg">
      <Stack sx={{ p: 4, gap: 4 }}>
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

          <Button variant="text" color="secondary">
            Text Secondary
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
