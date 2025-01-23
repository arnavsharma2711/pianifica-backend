import { z } from "zod";
import { userCardSchema } from "./user.schema";
import { TaskPriority, TaskStatus, TaskType } from "@prisma/client";
import { projectCardSchema } from "./project.schema";
import { commentSchema } from "./comment.schema";

export const createTaskSchema = z.object({
  projectId: z.number(),
  parentId: z.number().nullish(),
  title: z.string().min(3).max(50).trim(),
  type: z.nativeEnum(TaskType),
  summary: z.string().min(3).max(200).trim().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  assigneeId: z.number().nullish(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(50).trim().optional(),
  type: z.nativeEnum(TaskType).optional(),
  summary: z.string().min(3).max(200).trim().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.date().optional(),
  assigneeId: z.number().optional(),
});

export const taskSchema = z.object({
  id: z.number(),
  title: z.string().trim(),
  type: z.string().nullish(),
  summary: z.string().nullish(),
  status: z.string().nullish(),
  priority: z.string().nullish(),
  dueDate: z.date().nullish(),
  parentId: z.number().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taskActivity: z.array(z.object({})).nullish(),
  project: projectCardSchema,
  author: userCardSchema,
  assignee: userCardSchema.nullish(),
  comment: z.array(commentSchema).optional(),
  bookmark: z
    .array(z.object({}))
    .transform((arr) => arr.length > 0)
    .optional(),
});
