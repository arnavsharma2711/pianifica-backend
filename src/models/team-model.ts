import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createTeam = async ({
  name,
  organizationId,
  description,
}: {
  name: string;
  organizationId: number;
  description?: string;
}) => {
  return await prisma.team.create({
    data: {
      name,
      organizationId,
      description,
    },
  });
};

// Read

export const getTeamById = async ({
  id,
  organizationId,
}: {
  id: number;
  organizationId: number;
}) => {
  return await prisma.team.findUnique({
    where: { id, organizationId, deletedAt: null },
  });
};

export const getTeamByName = async ({
  name,
  organizationId,
}: {
  name: string;
  organizationId: number;
}) => {
  return await prisma.team.findUnique({
    where: {
      name_organizationId: {
        name,
        organizationId,
      },
      deletedAt: null,
    },
  });
};

export const getTeamsByOrganizationId = async ({
  organizationId,
  filters,
  fetchDeleted = false,
}: {
  organizationId: number;
  filters: Filter;
  fetchDeleted?: boolean;
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

  const teams = await prisma.team.findMany({
    where: whereClause,
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.team.count({
    where: whereClause,
  });

  return {
    teams,
    total_count,
  };
};

// Update

export const updateTeam = async ({
  id,
  updateBody,
}: {
  id: number;
  updateBody: {
    name?: string;
    description?: string;
  };
}) => {
  return await prisma.team.update({
    where: { id },
    data: updateBody,
  });
};

// Delete

export const deleteTeam = async ({ id }: { id: number }) => {
  return await prisma.team.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
