import { z } from "zod";

export const notificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  notifiableType: z.string(),
  notifiableId: z.number(),
  message: z.string(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
});
