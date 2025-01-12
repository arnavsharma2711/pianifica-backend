import { z } from "zod";

export const createOrganizationSchema = z.object({
	name: z.string().min(3).max(50).trim(),
	description: z.string().min(3).max(50).trim().optional(),
	address: z.string().min(3).max(50).trim().optional(),
	phone: z.string().min(3).max(50).trim().optional(),
	email: z.string().min(3).max(50).trim().optional(),
	website: z.string().min(3).max(50).trim().optional(),
});

export const updateOrganizationSchema = z.object({
	name: z.string().min(3).max(50).trim(),
	description: z.string().min(3).max(50).trim().optional(),
	address: z.string().min(3).max(50).trim().optional(),
	phone: z.string().min(3).max(50).trim().optional(),
	email: z.string().min(3).max(50).trim().optional(),
	website: z.string().min(3).max(50).trim().optional(),
});

export const organizationSchema = z.object({
	id: z.number(),
	name: z.string().min(3).max(50).trim(),
	description: z.string().min(3).max(50).trim().optional().nullable(),
	address: z.string().min(3).max(50).trim().optional().nullable(),
	phone: z.string().min(3).max(50).trim().optional().nullable(),
	email: z.string().min(3).max(50).trim().optional().nullable(),
	website: z.string().min(3).max(50).trim().optional().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});
