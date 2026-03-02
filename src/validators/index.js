import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .toLowerCase()
      .regex(
        /^[a-z0-9]+$/,
        "Username can only contain lowercase letters and numbers"
      ),

    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required"),

    email: z
      .string()
      .email("Invalid email address"),

    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address"),

    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const userChangeCurrentPasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .trim()
      .min(6, "Current password must be at least 6 characters"),

    newPassword: z
      .string()
      .trim()
      .min(6, "New password must be at least 6 characters"),
  }),
});

export const userForgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address"),
  }),
});

export const userResetPasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string()
      .trim()
      .min(6, "New password must be at least 6 characters"),
  }),
});
