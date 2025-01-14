import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createTeamsOnProjects = async ({
  teamId,
  projectId,
}: {
  teamId: number;
  projectId: number;
}) => {
  return await prisma.teamsOnProjects.create({
    data: {
      teamId,
      projectId,
    },
  });
};

// Read

export const getTeamsOnProjectsByTeamId = async ({
  teamId,
  filters,
}: {
  teamId: number;
  filters: Filter;
}) => {
  const projects = await prisma.teamsOnProjects.findMany({
    where: { teamId },
    include: {
      project: true,
    },
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.teamsOnProjects.count({
    where: { teamId },
  });

  return {
    projects,
    total_count,
  };
};

export const getTeamsOnProjectsByProjectId = async ({
  projectId,
  filters,
}: {
  projectId: number;
  filters: Filter;
}) => {
  const teams = await prisma.teamsOnProjects.findMany({
    where: { projectId },
    include: {
      team: true,
    },
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.teamsOnProjects.count({
    where: { projectId },
  });

  return {
    teams,
    total_count,
  };
};

export const getTeamsOnProjectsByTeamIdAndProjectId = async ({
  teamId,
  projectId,
}: {
  teamId: number;
  projectId: number;
}) => {
  return await prisma.teamsOnProjects.findUnique({
    where: { teamId_projectId: { teamId, projectId } },
  });
};

// Delete

export const deleteTeamsOnProjects = async ({
  teamId,
  projectId,
}: {
  teamId: number;
  projectId: number;
}) => {
  return await prisma.teamsOnProjects.delete({
    where: { teamId_projectId: { teamId, projectId } },
  });
};
