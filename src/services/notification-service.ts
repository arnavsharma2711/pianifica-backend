import { CustomError } from "../lib/error/custom.error";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import { getNotificationMessage } from "../lib/notificationMessageMap";
import { notificationSchema } from "../lib/schema/notification.schema";
import * as notificationModel from "../models/notification-model";

export const createNewNotification = async ({
  userId,
  notifiableType,
  notifiableId,
  status,
  variables,
}: {
  userId: number;
  notifiableType: string;
  notifiableId: number;
  status: string;
  variables: Record<string, string>;
}) => {
  const message = await getNotificationMessage({
    notifiableType,
    status,
    variables,
  });
  if (message) {
    await notificationModel.createNotification({
      userId,
      notifiableType,
      notifiableId,
      message,
    });
  }
};

export const createMultipleNotifications = async ({
  userIds,
  notifiableType,
  notifiableId,
  status,
  variables,
}: {
  userIds: number[];
  notifiableType: string;
  notifiableId: number;
  status: string;
  variables: Record<string, string>;
}) => {
  const message = await getNotificationMessage({
    notifiableType,
    status,
    variables,
  });
  if (message) {
    await notificationModel.createMultipleNotifications({
      userIds,
      notifiableType,
      notifiableId,
      message,
    });
  }
};

export const getAllUserExistingNotifications = async ({
  userId,
  filters,
}: {
  userId: number;
  filters: FilterOptions;
}) => {
  const { notifications, total_count } =
    await notificationModel.getNotificationsByUserId({
      userId,
      filters: getDefaultFilter(filters),
    });

  return {
    notifications: notifications.map((notification) =>
      notificationSchema.parse(notification),
    ),
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
  const notification = await notificationModel.getNotificationById({
    id,
    userId,
  });

  if (!notification) {
    throw new CustomError(404, "Notification not found");
  }
  return notification;
};

export const markAllExistingNotificationAsRead = async ({
  userId,
}: {
  userId: number;
}) => {
  await notificationModel.markAllNotificationAsRead({ userId });
};

export const markExistingNotificationAsRead = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  await getNotificationById({ id, userId });
  await notificationModel.updateNotification({ id, readAt: new Date() });
};

export const markExistingNotificationAsUnread = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  await getNotificationById({ id, userId });
  await notificationModel.updateNotification({ id, readAt: null });
};

export const deleteExistingNotification = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  await getNotificationById({ id, userId });
  await notificationModel.deleteNotification({ id, userId });
};
