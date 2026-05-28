import { Box, Card, CardContent, Typography } from "@mui/material";

import { PageHeader } from "@/components/page-header";

type MaterialSymbolProps = {
  icon: string;
  size?: number;
  color?: string;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
};

function MaterialSymbol({
  icon,
  size = 48,
  color,
  weight = 700,
}: MaterialSymbolProps) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        color: color,
        fontVariationSettings: `'wght' ${weight}`,
      }}
    >
      {icon}
    </span>
  );
}

type StatCardProps = {
  icon: string;
  value: string;
  label: string;
  color: string;
};

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          textAlign: "center",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <MaterialSymbol icon={icon} color={color} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function page() {
  const stats = [
    {
      icon: "sensors",
      value: "306.25M",
      label: "Total Requests",
      color: "#3527fd", // primary.main
    },
    {
      icon: "check",
      value: "305.75M",
      label: "Allowed Requests",
      color: "#05C6C6", // pairingTeal.main
    },
    {
      icon: "block",
      value: "500.34K",
      label: "Blocked Requests",
      color: "#000000", // secondary.main
    },
    {
      icon: "skull",
      value: "659.01K",
      label: "Threats",
      color: "#CE008E", // tertiary.main
    },
  ];

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <PageHeader title="Overview" />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
            p: 2,
          }}
        >
          {/* Geo Activity card */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Geo Activity
                </Typography>
                <Typography sx={{ fontSize: 12 }} color="text.secondary">
                  Showing top 100 sites
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "background.default",
                  borderRadius: 1,
                  py: 8,
                  gap: 1.5,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#344767" }}>map</span>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#344767",
                    textAlign: "center",
                    fontFamily: "Montserrat Variable, sans-serif",
                  }}
                >
                  You haven&apos;t set a site<br />location yet
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          {/* Stat cards: 2x2 grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
            }}
          >
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                color={stat.color}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
