import { Types } from "mongoose";
import * as z from "zod";

export const loginUserSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
