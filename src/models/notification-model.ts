import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createNotification = async ({
  userId,
  notifiableType,
  notifiableId,
  message,
}: {
  userId: number;
  notifiableType: string;
  notifiableId: number;
  message: string;
}) => {
  return await prisma.notification.create({
    data: {
      userId,
      notifiableType,
      notifiableId,
      message,
    },
  });
};

export const createMultipleNotifications = async ({
  userIds,
  notifiableType,
  notifiableId,
  message,
}: {
  userIds: number[];
  notifiableType: string;
  notifiableId: number;
  message: string;
}) => {
  const notifications = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      notifiableType,
      notifiableId,
      message,
    })),
  });

  return notifications;
};

// Read

export const getNotificationsByUserId = async ({
  userId,
  filters,
}: {
  userId: number;
  filters: Filter;
}) => {
  const whereClause: {
    AND: {
      deletedAt?: null;
      userId: number;
      notifiableType?: { equals: string } | undefined;
    };
  } = {
    AND: {
      deletedAt: null,
      userId,
    },
  };

  if (filters.query) {
    whereClause.AND.notifiableType = {
      equals: filters.query,
    };
  }
  const notifications = await prisma.notification.findMany({
    where: whereClause,
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.notification.count({
    where: whereClause,
  });

  return {
    notifications,
    total_count,
  };
};

export const getNotificationById = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  return await prisma.notification.findUnique({
    where: { id, userId, deletedAt: null },
  });
};

// Update

export const updateNotification = async ({
  id,
  message,
  readAt,
}: {
  id: number;
  message?: string;
  readAt?: Date | null;
}) => {
  return await prisma.notification.update({
    where: { id },
    data: { message, readAt },
  });
};

export const markAllNotificationAsRead = async ({
  userId,
}: {
  userId: number;
}) => {
  return await prisma.notification.updateMany({
    where: { userId, deletedAt: null, readAt: null },
    data: { readAt: new Date() },
  });
};

// Delete

export const deleteNotification = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  return await prisma.notification.update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });
};
