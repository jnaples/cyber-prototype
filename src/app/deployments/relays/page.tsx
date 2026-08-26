import { Card, CardContent, Typography } from "@mui/material";

export default function RelaysPage() {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="cardTitle">Relays</Typography>
        <Typography variant="body1" sx={{ mt: 0.5, color: "text.primary" }}>
          On-network relays that forward DNS for the sites behind them.
        </Typography>
      </CardContent>
    </Card>
  );
}
