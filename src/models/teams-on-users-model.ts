import type { TeamRole } from "@prisma/client";
import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createTeamsOnUsers = async ({
  userId,
  teamId,
  role = "MEMBER",
}: {
  userId: number;
  teamId: number;
  role?: TeamRole;
}) => {
  return await prisma.teamsOnUsers.create({
    data: {
      userId,
      teamId,
      role,
    },
  });
};

// Read

export const getTeamsOnUsersByUserId = async ({
  userId,
  filters,
}: {
  userId: number;
  filters: Filter;
}) => {
  const teams = await prisma.teamsOnUsers.findMany({
    where: { userId },
    include: {
      team: true,
    },
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.teamsOnUsers.count({
    where: { userId },
  });

  return {
    teams,
    total_count,
  };
};

export const getTeamsOnUsersByTeamId = async ({
  teamId,
  filters,
}: {
  teamId: number;
  filters: Filter;
}) => {
  const users = await prisma.teamsOnUsers.findMany({
    where: { teamId },
    include: {
      user: true,
    },
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.teamsOnUsers.count({
    where: { teamId },
  });

  return {
    users,
    total_count,
  };
};

export const getTeamsOnUsersByUserIdAndTeamId = async ({
  userId,
  teamId,
}: {
  userId: number;
  teamId: number;
}) => {
  return await prisma.teamsOnUsers.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
};

export const getAllTeamsOnUsersByTeamId = async ({
  teamId,
}: {
  teamId: number;
}) => {
  return await prisma.teamsOnUsers.findMany({
    where: { teamId },
    select: {
      userId: true,
    },
  });
};

// Update

export const updateTeamsOnUsersRole = async ({
  userId,
  teamId,
  role,
}: {
  userId: number;
  teamId: number;
  role?: TeamRole;
}) => {
  return await prisma.teamsOnUsers.update({
    where: { userId_teamId: { userId, teamId } },
    data: {
      role,
    },
  });
};

// Delete

export const deleteTeamsOnUsers = async ({
  userId,
  teamId,
}: {
  userId: number;
  teamId: number;
}) => {
  return await prisma.teamsOnUsers.delete({
    where: { userId_teamId: { userId, teamId } },
  });
};
