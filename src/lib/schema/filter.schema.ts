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
});
