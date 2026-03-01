import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z
      .trim()
      .string()
      .min(3, "Username must be at least 3 characters")
      .lowercase("Username must be in lowercase")
      .regex(
        /^[a-z0-9]+$/,
        "Username can only contain lowercase letters and numbers",
      ),
    fullName: z
      .trim()
      .string()
      .min(1, "Full name is required"),
    email: z
      .string()
      .email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .trim("Password cannot have leading or trailing spaces")
      .nonempty("Password cannot be empty"),
  }),
});

