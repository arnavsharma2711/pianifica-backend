import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  description: z.string().min(3).max(250).trim().optional(),
  address: z.string().min(3).max(100).trim().optional(),
  phone: z.string().min(3).max(20).trim().optional(),
  email: z.string().min(3).max(50).trim().optional(),
  website: z.string().min(3).max(50).trim().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  description: z.string().min(3).max(250).trim().optional(),
  address: z.string().min(3).max(100).trim().optional(),
  phone: z.string().min(3).max(20).trim().optional(),
  email: z.string().min(3).max(50).trim().optional(),
  website: z.string().min(3).max(50).trim().optional(),
});

export const organizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullish(),
  address: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  website: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
