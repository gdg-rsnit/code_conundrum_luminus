import * as z from "zod";

export const createRoundSchema = z.object({
  roundNumber: z.number().int().positive(),
  duration: z.number().int().positive().min(1, "Duration must be at least 1 minute"),
  status: z.enum(["DRAFT", "LIVE", "ENDED"]).optional().default("DRAFT"),
});

export const updateRoundSchema = z.object({
  duration: z.number().int().positive().optional(),
  status: z.enum(["DRAFT", "LIVE", "ENDED"]).optional(),
  startTime: z.iso.datetime().or(z.date()).optional().nullable(),
  endTime: z.iso.datetime().or(z.date()).optional().nullable(),
  isPaused: z.boolean().optional(),
});

export const pauseRoundSchema = z.object({
  isPaused: z.boolean(),
});

export type CreateRoundInput = z.infer<typeof createRoundSchema>;
export type UpdateRoundInput = z.infer<typeof updateRoundSchema>;
export type PauseRoundInput = z.infer<typeof pauseRoundSchema>;
