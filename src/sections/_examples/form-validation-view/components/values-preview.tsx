import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Portal from "@mui/material/Portal";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";

const classes = {
  item: "item",
  key: "item__key",
  value: "item__value",
};

type Props = {
  sx?: SxProps<Theme>;
};

export function ValuesPreview({ sx }: Props) {
  const { watch, formState } = useFormContext();

  const values = watch();

  const totalValues = Object.keys(values).length;
  const totalErrors = Object.keys(formState.errors).length;
  return (
    <Portal>
      <Box
        sx={[
          (theme) => ({
            width: 280,
            color: "common.white",
            zIndex: theme.zIndex.drawer,
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box sx={{ py: 1.5, pl: 1.5, display: "flex", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            Debug
          </Typography>
        </Box>

        <Group label="State" sx={{ color: "success.light" }}>
          {[
            "submitCount",
            "isDirty",
            "isValid",
            "disabled",
            "isLoading",
            "isSubmitted",
            "isSubmitting",
            "isValidating",
            "isSubmitSuccessful",
          ].map((item) => (
            <div key={item} className={classes.item}>
              <span className={classes.key}>{item}</span>
              <span className={classes.value}>
                {JSON.stringify(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (formState as Record<string, any>)[item],
                  null,
                  2,
                )}
              </span>
            </div>
          ))}
        </Group>

        <Group
          label={`Values (${totalValues})`}
          sx={{ color: "warning.light" }}
        >
          {Object.keys(values).map((key) => {
            const value = values[key];

            return (
              <div key={key} className={classes.item}>
                <span className={classes.key}>{key}</span>
                <span
                  className={classes.value}
                  style={{
                    ...((value === null || value === undefined) && {
                      color: "coral",
                    }),
                    ...(typeof value === "number" && { color: "violet" }),
                  }}
                >
                  {parseValue(values, key)}
                </span>
              </div>
            );
          })}
        </Group>

        <Group label={`Errors (${totalErrors})`} sx={{ color: "error.light" }}>
          {JSON.stringify(Object.keys(formState.errors), null, 2)}
        </Group>

        <Group label="Dirty fields" sx={{ color: "info.light" }}>
          {JSON.stringify(Object.keys(formState.dirtyFields), null, 2)}
        </Group>

        <Group label="Touched fields" sx={{ color: "secondary.light" }}>
          {JSON.stringify(Object.keys(formState.touchedFields), null, 2)}
        </Group>
      </Box>
    </Portal>
  );
}

type GroupProps = {
  label: string;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
};

function Group({ label, children, sx }: GroupProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      sx={[
        (theme) => ({
          borderBottom: `solid 1px ${theme.vars.palette.divider}`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <ButtonBase
        onClick={() => setExpanded(!expanded)}
        sx={{
          py: 1,
          px: 1.5,
          width: 1,
          typography: "overline",
          justifyContent: "space-between",
          ...(expanded && { bgcolor: "action.hover" }),
        }}
      >
        {label}
      </ButtonBase>

      <Collapse in={expanded}>
        <Box
          sx={{
            p: 1,
            gap: 0.25,
            display: "flex",
            typography: "caption",
            flexDirection: "column",
            [`& .${classes.item}`]: {
              display: "inline-flex",
              alignItems: "flex-start",
            },
            [`& .${classes.key}`]: {
              px: 0.5,
              color: "common.white",
              bgcolor: "rgba(0, 0, 0, 0.4)",
            },
            [`& .${classes.value}`]: {
              flex: "1 1 auto",
              textAlign: "right",
              bgcolor: "rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

function parseValue(values: FieldValues, key: string) {
  if (values[key] === undefined) {
    return "undefined";
  }
  return JSON.stringify(values[key], null, 2) || "---";
}
