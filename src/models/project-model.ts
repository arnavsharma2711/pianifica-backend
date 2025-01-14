import { ProjectStatus } from "@prisma/client";
import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createProject = async ({
  name,
  description,
  budget,
  status = ProjectStatus.ACTIVE,
  organizationId,
  createdBy,
}: {
  name: string;
  description?: string;
  budget?: number;
  status?: ProjectStatus;
  organizationId: number;
  createdBy: number;
}) => {
  return await prisma.project.create({
    data: {
      name,
      description,
      budget,
      status,
      organizationId,
      createdBy,
    },
  });
};

// Read

export const getProjects = async ({
  organizationId,
  filters,
  fetchDeleted,
}: {
  organizationId: number;
  filters: Filter;
  fetchDeleted: boolean;
}) => {
  const whereClause: {
    AND: {
      deletedAt?: null;
      organizationId: number;
      name?: { contains: string } | undefined;
    };
  } = {
    AND: {
      deletedAt: fetchDeleted ? undefined : null,
      organizationId,
    },
  };

  if (filters.query) {
    whereClause.AND.name = {
      contains: filters.query,
    };
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.project.count({
    where: whereClause,
  });

  return {
    projects,
    total_count,
  };
};

export const getProjectById = async ({
  organizationId,
  id,
}: {
  organizationId: number;
  id: number;
}) => {
  return await prisma.project.findUnique({
    where: { id, organizationId, deletedAt: null },
  });
};

export const getProjectByName = async ({
  organizationId,
  name,
}: {
  organizationId: number;
  name: string;
}) => {
  return await prisma.project.findFirst({
    where: { name, organizationId, deletedAt: null },
  });
};

// Update

export const updateProject = async ({
  id,
  body,
}: {
  id: number;
  body: {
    name?: string;
    description?: string;
    budget?: number;
    status?: ProjectStatus;
  };
}) => {
  return await prisma.project.update({
    where: { id },
    data: body,
  });
};

// Delete

export const deleteProject = async ({ id }: { id: number }) => {
  return await prisma.project.update({
    where: { id },
    data: { status: ProjectStatus.ARCHIVED, deletedAt: new Date() },
  });
};
