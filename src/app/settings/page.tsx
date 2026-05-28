import { zodResolver } from "@hookform/resolvers/zod";
import { Container, Stack, Tab, Tabs } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from "zod";

import Footer from "@/components/footer";
import { Field, Form } from "@/components/hook-form";
import { InlineLabelSelect } from "@/components/inline-label-select";
import { PageHeader } from "@/components/page-header";

const AGE_OPTIONS: { value: number; label: string }[] = [
  { value: 10, label: "Ten" },
  { value: 20, label: "Twenty" },
  { value: 30, label: "Thirty" },
];

export default function MainLayout() {
  const [age, setAge] = useState<number | "">("");

  // Profile form schema and hook
  const ProfileSchema = zod.object({
    fullName: zod
      .string()
      .min(1, { message: "Full name is required!" })
      .min(3, { message: "Minimum 3 characters!" })
      .max(32, { message: "Maximum 32 characters!" }),
    email: zod
      .string()
      .min(1, { message: "Email is required!" })
      .email({ message: "Email must be valid!" }),
  });
  type ProfileFormType = zod.infer<typeof ProfileSchema>;
  const methods = useForm<ProfileFormType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { fullName: "", email: "" },
  });
  const onSubmit = methods.handleSubmit((data) => {
    // TODO: handle form submission
    alert(`Profile updated!\n${JSON.stringify(data, null, 2)}`);
  });

  // Tabs state and helpers
  const [value, setValue] = useState(0);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box
            sx={{
              pt: 2,
              pb: 2,
              px: 2,

              color: (
                theme: Theme & {
                  vars?: { palette?: { text?: { primary?: string } } };
                },
              ) =>
                theme.vars?.palette?.text?.primary ??
                theme.palette.text.primary,
            }}
          >
            {children}
          </Box>
        )}
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100svh",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <PageHeader title="Settings" />
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            py: 0,
            display: "flex",
            alignContent: "flex-end",
            // neutral background so the tabs area matches panels in light/dark
            backgroundColor: (
              theme: Theme & {
                vars?: { palette?: { background?: { neutral?: string } } };
              },
            ) =>
              theme.vars?.palette?.background?.neutral ??
              theme.palette.background.neutral,
            // ensure text is readable on top of the neutral background
            color: (
              theme: Theme & {
                vars?: { palette?: { text?: { primary?: string } } };
              },
            ) =>
              theme.vars?.palette?.text?.primary ?? theme.palette.text.primary,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab
              label="Item One"
              {...a11yProps(0)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: (
                    theme: Theme & {
                      vars?: {
                        palette?: { background?: { paper?: string } };
                      };
                    },
                  ) =>
                    theme.vars?.palette?.background?.paper ??
                    theme.palette.background.paper,
                  borderTopLeftRadius: "6px",
                  borderTopRightRadius: "6px",
                  boxShadow: (theme) => theme.shadows[3],
                  zIndex: (theme) => theme.zIndex.appBar,
                },
              }}
            />
            <Tab
              label="Item Two"
              {...a11yProps(1)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: (
                    theme: Theme & {
                      vars?: {
                        palette?: { background?: { paper?: string } };
                      };
                    },
                  ) =>
                    theme.vars?.palette?.background?.paper ??
                    theme.palette.background.paper,
                  borderTopLeftRadius: "6px",
                  borderTopRightRadius: "6px",
                  boxShadow: (theme) => theme.shadows[3],
                  zIndex: (theme) => theme.zIndex.appBar,
                },
              }}
            />
            <Tab
              label="Item Three"
              {...a11yProps(2)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: (
                    theme: Theme & {
                      vars?: {
                        palette?: { background?: { paper?: string } };
                      };
                    },
                  ) =>
                    theme.vars?.palette?.background?.paper ??
                    theme.palette.background.paper,
                  borderTopLeftRadius: "6px",
                  borderTopRightRadius: "6px",
                  boxShadow: (theme) => theme.shadows[3],
                  zIndex: (theme) => theme.zIndex.appBar,
                },
              }}
            />
          </Tabs>
        </Box>
        <Container maxWidth="lg">
          <TabPanel value={value} index={0}>
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="cardTitle" gutterBottom>
                    Profile
                  </Typography>
                  {/* Profile Form */}
                  <Form methods={methods} onSubmit={onSubmit}>
                    <Stack spacing={2}>
                      <Field.Text name="fullName" label="Full Name" />
                      <Field.Text
                        name="email"
                        label="Email"
                        type="email"
                        helperText="We'll never share your email."
                      />
                      <InlineLabelSelect
                        label="Age"
                        options={AGE_OPTIONS}
                        value={age}
                        onChange={setAge}
                      />
                    </Stack>
                  </Form>
                </Stack>
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value={value} index={1}>
            Item Two
          </TabPanel>
          <TabPanel value={value} index={2}>
            Item Three
          </TabPanel>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
