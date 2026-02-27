import { Types } from "mongoose";
import * as z from "zod";

const objectIdSchema = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createUserSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  role: z.enum(["ADMIN", "TEAM"]).optional().default("TEAM"),
  teamId: objectIdSchema.optional().nullable(),
});

export const updateUserSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase()
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters")
    .optional(),
  role: z.enum(["ADMIN", "TEAM"]).optional(),
  banned: z.boolean().optional(),
  teamId: objectIdSchema.optional().nullable(),
});

export const loginUserSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
