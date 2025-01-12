import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";
import type { Organization } from "../lib/schema/interface";

// Create

export const createOrganization = async ({
	name,
	description,
	address,
	phone,
	email,
	website,
	status = "active",
}: Organization) => {
	return await prisma.organization.create({
		data: {
			name,
			description,
			address,
			phone,
			email,
			website,
			status,
		},
	});
};

// Read

export const getOrganizationById = async ({ id }: { id: number }) => {
	return await prisma.organization.findFirst({
		where: { AND: [{ id }, { deletedAt: null }] },
	});
};

export const getOrganizationByName = async ({ name }: { name: string }) => {
	return await prisma.organization.findFirst({
		where: { AND: [{ name }, { deletedAt: null }] },
	});
};

export const getAllOrganizations = async ({ filters }: { filters: Filter }) => {
	const organizations = await prisma.organization.findMany({
		where: { deletedAt: null },
		take: filters.limit,
		skip: filters.limit * (filters.page - 1),
		orderBy: { [filters.orderBy]: filters.order },
	});

	const total_count = await prisma.organization.count({
		where: { deletedAt: null },
	});
	return { organizations, total_count };
};

// Update

export const updateOrganization = async ({
	id,
	name,
	description,
	address,
	phone,
	email,
	website,
}: Organization) => {
	return await prisma.organization.update({
		where: { id },
		data: {
			name,
			description,
			address,
			phone,
			email,
			website,
		},
	});
};

// Delete

export const deleteOrganization = async ({ id }: { id: number }) => {
	return await prisma.organization.update({
		where: { id },
		data: { status: "deleted", deletedAt: new Date() },
	});
};
