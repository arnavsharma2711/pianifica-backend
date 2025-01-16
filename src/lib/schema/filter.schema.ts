import { TaskPriority, TaskStatus, TaskType } from "@prisma/client";
import { z } from "zod";

export const filterSchema = z.object({
  query: z.string().min(2).max(50).trim().optional(),
  page: z
    .string()
    .transform((val) => Number(val))
    .optional(),
  limit: z
    .string()
    .transform((val) => Number(val))
    .optional(),
  orderBy: z.enum(["createdAt", "updatedAt", "id"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  fetchDeleted: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export const taskFilterSchema = filterSchema.extend({
  type: z.nativeEnum(TaskType).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  userId: z
    .string()
    .transform((val) => Number(val))
    .optional(),
});
