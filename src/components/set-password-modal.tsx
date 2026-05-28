import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogContent,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const setPasswordSchema = z
  .object({
    temporaryPassword: z.string().min(1, "Temporary password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .refine((val) => {
        const checks = [
          /[a-z]/.test(val),
          /[A-Z]/.test(val),
          /[0-9]/.test(val),
          /[^a-zA-Z0-9]/.test(val),
        ];
        return checks.filter(Boolean).length >= 3;
      }, "Must contain at least 3 of: lowercase letters, uppercase letters, numbers, special characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { temporaryPassword: string; newPassword: string }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SetPasswordModal({ open, onClose, onSubmit }: SetPasswordModalProps) {
  const [showTemporary, setShowTemporary] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      temporaryPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onFormSubmit = (data: SetPasswordFormValues) => {
    onSubmit({
      temporaryPassword: data.temporaryPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "6px",
            maxWidth: 560,
            width: "100%",
          },
        },
      }}
    >
      <DialogContent sx={{ p: "48px" }}>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <Stack spacing={4}>
            {/* Header */}
            <Stack spacing={1}>
              <Typography
                variant="h4"
                sx={{ textAlign: "center" }}
              >
                Please set a new password
              </Typography>
              <Typography
                variant="body1"
                sx={{ textAlign: "center", color: "text.primary" }}
              >
                For your security, you must set a new password before
                continuing.
              </Typography>
            </Stack>

            {/* Temporary Password */}
            <FormControl fullWidth error={!!errors.temporaryPassword}>
              <FormLabel
                sx={{
                  fontFamily: (t: Theme) => t.typography.fontSecondaryFamily,
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: 1.33,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                Temporary Password
              </FormLabel>
              <OutlinedInput
                {...register("temporaryPassword")}
                type={showTemporary ? "text" : "password"}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowTemporary((v) => !v)}
                      edge="end"
                    >
                      <span className="material-symbols-outlined">
                        {showTemporary ? "visibility_off" : "visibility"}
                      </span>
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.temporaryPassword && (
                <FormHelperText>
                  {errors.temporaryPassword.message}
                </FormHelperText>
              )}
            </FormControl>

            {/* New Password */}
            <Stack spacing={1}>
              <FormControl fullWidth error={!!errors.newPassword}>
                <FormLabel
                  sx={{
                    fontFamily: (t: Theme) => t.typography.fontSecondaryFamily,
                    fontWeight: 600,
                    fontSize: 18,
                    lineHeight: 1.33,
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  New Password
                </FormLabel>
                <OutlinedInput
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNew((v) => !v)}
                        edge="end"
                      >
                        <span className="material-symbols-outlined">
                          {showNew ? "visibility_off" : "visibility"}
                        </span>
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <FormHelperText sx={{ ml: 0 }}>
                  {errors.newPassword?.message ??
                    "Must be at least 8 characters and contain at least 3 of: lowercase letters, uppercase letters, numbers, special characters."}
                </FormHelperText>
              </FormControl>

              {/* Confirm Password */}
              <FormControl fullWidth error={!!errors.confirmPassword}>
                <FormLabel
                  sx={{
                    fontFamily: (t: Theme) => t.typography.fontSecondaryFamily,
                    fontWeight: 600,
                    fontSize: 18,
                    lineHeight: 1.33,
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  Confirm Password
                </FormLabel>
                <OutlinedInput
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((v) => !v)}
                        edge="end"
                      >
                        <span className="material-symbols-outlined">
                          {showConfirm ? "visibility_off" : "visibility"}
                        </span>
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {errors.confirmPassword && (
                  <FormHelperText>
                    {errors.confirmPassword.message}
                  </FormHelperText>
                )}
              </FormControl>
            </Stack>

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "1.25px",
                textTransform: "uppercase",
                py: "6px",
              }}
            >
              Set Password
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
