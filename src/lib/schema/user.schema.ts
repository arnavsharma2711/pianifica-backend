import { z } from "zod";
import { organizationSchema } from "./organization.schema";

export const createUserSchema = z.object({
  firstName: z.string().min(3).max(50).trim(),
  lastName: z.string().min(3).max(50).trim().optional(),
  username: z.string().min(3).max(25).trim().toLowerCase(),
  email: z.string().min(3).max(50).trim(),
  password: z.string().min(3).max(50).trim(),
  profilePictureUrl: z.string().min(3).max(50).trim().optional(),
  phone: z.string().min(3).max(50).trim().optional(),
  designation: z.string().min(3).max(50).trim().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(3).max(50).trim().optional(),
  lastName: z.string().min(3).max(50).trim().optional(),
  username: z.string().min(3).max(25).toLowerCase().trim().optional(),
  email: z.string().min(3).max(50).toLowerCase().trim().optional(),
  password: z.string().min(3).max(50).trim().optional(),
  profilePictureUrl: z.string().min(3).max(50).trim().optional(),
  phone: z.string().min(3).max(50).trim().optional(),
  designation: z.string().min(3).max(50).trim().optional(),
});

export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string().nullish(),
  username: z.string(),
  email: z.string(),
  profilePictureUrl: z.string().nullish(),
  phone: z.string().nullish(),
  designation: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  organization: organizationSchema.optional(),
});

export const userCardSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string().nullish(),
  username: z.string(),
  profilePictureUrl: z.string().nullish(),
});
