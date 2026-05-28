import { Box, Card, CardContent, Typography } from "@mui/material";

import { PageHeader } from "@/components/page-header";
import { brandConfig } from "@/theme/brand-config";

type SubscriptionCardProps = {
  title: string;
  subtitle?: string;
  iconSrc?: string;
  available: string;
  purchased: string;
};

function SubscriptionCard({
  title,
  subtitle,
  iconSrc,
  available,
  purchased,
}: SubscriptionCardProps) {
  return (
    <Card
      sx={{
        width: 183,
        height: 148,
        flexShrink: 0,
        borderRadius: "6px",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&:last-child": { pb: 2 },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            {iconSrc && (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={iconSrc} alt="" width={24} height={24} />
              </Box>
            )}
            <Typography
              sx={{
                fontFamily: brandConfig.fontFamily.primary,
                fontWeight: 700,
                fontSize: 16,
                lineHeight: 1.5,
                color: "text.primary",
              }}
            >
              {title}
            </Typography>
          </Box>
          {subtitle && (
            <Typography
              sx={{
                fontFamily: brandConfig.fontFamily.primary,
                fontWeight: 400,
                fontSize: 12,
                lineHeight: 1.66,
                color: "text.primary",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            sx={{
              fontFamily: brandConfig.fontFamily.secondary,
              fontWeight: 600,
              fontSize: 18,
              lineHeight: 1.33,
              color: "text.primary",
            }}
          >
            {available} Available
          </Typography>
          <Typography
            sx={{
              fontFamily: brandConfig.fontFamily.secondary,
              fontWeight: 600,
              fontSize: 18,
              lineHeight: 1.33,
              color: "text.primary",
            }}
          >
            {purchased} Purchased
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const subscriptions: SubscriptionCardProps[] = [
    {
      title: "Basic",
      subtitle: "Network Traffic",
      available: "20",
      purchased: "720",
    },
    {
      title: "Pro",
      subtitle: "Roaming Clients",
      available: "50",
      purchased: "1,850",
    },
    {
      title: "Guardian VPN",
      iconSrc: "/guardian-vpn.svg",
      available: "75",
      purchased: "1,500",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <PageHeader title="Subscriptions" />
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", p: 2 }}>
        {subscriptions.map((s) => (
          <SubscriptionCard key={s.title} {...s} />
        ))}
      </Box>
    </Box>
  );
}
