import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3).max(50).trim(),
  description: z.string().min(3).max(200).trim().optional(),
  budget: z.number().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(50).trim().optional(),
  description: z.string().min(3).max(200).trim().optional(),
  budget: z.number().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
