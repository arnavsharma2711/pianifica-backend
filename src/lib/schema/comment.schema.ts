import { z } from "zod";
import { userCardSchema } from "./user.schema";

export const createCommentSchema = z.object({
  taskId: z.number(),
  content: z.string().min(1).max(200).trim(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(200).trim(),
});

export const commentSchema = z.object({
  id: z.number(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: userCardSchema,
});
