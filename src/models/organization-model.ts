import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createOrganization = async ({
  name,
  description,
  address,
  phone,
  email,
  website,
  status = "active",
}: {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: string;
}) => {
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

export const updateOrganization = async (updateBody: {
  id: number;
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}) => {
  const { id, ...data } = updateBody;
  return await prisma.organization.update({
    where: { id },
    data,
  });
};

// Delete

export const deleteOrganization = async ({ id }: { id: number }) => {
  return await prisma.organization.update({
    where: { id },
    data: { status: "deleted", deletedAt: new Date() },
  });
};
