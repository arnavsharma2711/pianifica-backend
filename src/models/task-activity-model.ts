import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createTaskActivity = async ({
  taskId,
  userId,
  actionType,
  actionOn,
  previousValue,
  updatedValue,
}: {
  taskId: number;
  userId: number;
  actionType: string;
  actionOn: string;
  previousValue?: string;
  updatedValue?: string;
}) => {
  return await prisma.taskActivity.create({
    data: {
      taskId,
      userId,
      actionType,
      actionOn,
      previousValue,
      updatedValue,
    },
  });
};

// Read

export const getTaskActivityByTaskId = async ({
  taskId,
  filters,
}: {
  taskId: number;
  filters: Filter;
}) => {
  const activities = await prisma.taskActivity.findMany({
    where: {
      taskId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          profilePictureUrl: true,
        },
      },
    },
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.taskActivity.count({
    where: {
      taskId,
    },
  });

  return {
    activities,
    total_count,
  };
};

export const getTaskActivityByTaskIdAndAction = async ({
  taskId,
  actionType,
  actionOn,
}: {
  taskId: number;
  actionType: string;
  actionOn: string;
}) => {
  return await prisma.taskActivity.findMany({
    where: {
      taskId,
      actionType,
      actionOn,
    },
  });
};
