import { Button, Typography } from "@mui/material";
import Box from "@mui/material/Box";

import { TabbedDataCard } from "@/components/tabbed-data-card";

export default function SitesPage() {
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              install_desktop
            </span>
          }
        >
          Install Roaming Client
        </Button>
      </Box>
      <TabbedDataCard>
        <Typography sx={{ p: 2 }}>hi</Typography>
      </TabbedDataCard>
    </>
  );
}
