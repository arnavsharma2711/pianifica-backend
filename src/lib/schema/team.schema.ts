import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(3).max(50).trim(),
  description: z.string().min(3).max(50).trim().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(3).max(50).trim().optional(),
  description: z.string().min(3).max(50).trim().optional(),
});

export const teamSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
