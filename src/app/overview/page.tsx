import { Box, Card, CardContent, Typography } from "@mui/material";

import { PageHeader } from "@/components/page-header";
import { brandConfig } from "@/theme/brand-config";

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

export default function Page() {
  const stats = [
    {
      icon: "sensors",
      value: "306.25M",
      label: "Total Requests",
      color: "var(--dnsf-palette-primary-main)",
    },
    {
      icon: "check",
      value: "305.75M",
      label: "Allowed Requests",
      color: "var(--dnsf-palette-pairingTeal-main)",
    },
    {
      icon: "block",
      value: "500.34K",
      label: "Blocked Requests",
      color: "var(--dnsf-palette-secondary-main)",
    },
    {
      icon: "skull",
      value: "659.01K",
      label: "Threats",
      color: "var(--dnsf-palette-tertiary-main)",
    },
  ];

  return (
    <>
      <PageHeader title="Overview" />
      <Box sx={{ height: "100%", overflowY: "auto", pb: 14 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 2,
            p: 2,
          }}
        >
          {/* Geo Activity card */}
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
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
                  flex: 1,
                  gap: 1.5,
                }}
              >
                <Box
                  component="span"
                  className="material-symbols-outlined"
                  sx={{ fontSize: 40, color: "text.primary" }}
                >
                  map
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    textAlign: "center",
                    fontFamily: brandConfig.fontFamily.secondary,
                  }}
                >
                  You haven&apos;t set a site
                  <br />
                  location yet
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

        {/* Second section: 5 stat cards + Request Activity */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
            gap: 2,
            px: 2,
            pb: 2,
          }}
        >
          {/* Left: 5 stat cards stacked as 2+3 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 2,
              }}
            >
              {[
                {
                  icon: "location_on",
                  value: "0 / 1",
                  label: "Sites Protected",
                  color: "var(--dnsf-palette-success-main)",
                },
                {
                  icon: "devices",
                  value: "0",
                  label: "Roaming Clients Protected",
                  color: "var(--dnsf-palette-tertiary-main)",
                },
              ].map((stat) => (
                <StatCard
                  key={stat.label}
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                  color={stat.color}
                />
              ))}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              {[
                {
                  icon: "stacks",
                  value: "0",
                  label: "Collections",
                  color: "var(--dnsf-palette-pairingTeal-main)",
                },
                {
                  icon: "person",
                  value: "0",
                  label: "Users",
                  color: "var(--dnsf-palette-pairingPurple-main)",
                },
                {
                  icon: "hub",
                  value: "0",
                  label: "Relays",
                  color: "var(--dnsf-palette-text-primary)",
                },
              ].map((stat) => (
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

          {/* Right: Request Activity card */}
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontFamily: brandConfig.fontFamily.secondary }}
                >
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    Request Activity:
                  </Box>
                  <Box component="span" sx={{ fontWeight: 400 }}>
                    {" "}
                    Last 7 Days
                  </Box>
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {[
                    {
                      label: "Allowed",
                      color: "var(--dnsf-palette-info-light)",
                    },
                    {
                      label: "Blocked",
                      color: "var(--dnsf-palette-secondary-main)",
                    },
                    {
                      label: "Threats",
                      color: "var(--dnsf-palette-tertiary-main)",
                    },
                  ].map(({ label, color }) => (
                    <Box
                      key={label}
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            border: `2px solid ${color}`,
                            bgcolor: "transparent",
                          }}
                        />
                        <Box sx={{ width: 8, height: 2, bgcolor: color }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "background.default",
                  borderRadius: 1,
                  flex: 1,
                  gap: 1.5,
                }}
              >
                <Box
                  component="span"
                  className="material-symbols-outlined"
                  sx={{ fontSize: 40, color: "text.primary" }}
                >
                  map
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    textAlign: "center",
                    fontFamily: brandConfig.fontFamily.secondary,
                  }}
                >
                  Nothing to show yet
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    textAlign: "center",
                    fontFamily: brandConfig.fontFamily.primary,
                  }}
                >
                  Requests over time will show here once traffic is received.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
