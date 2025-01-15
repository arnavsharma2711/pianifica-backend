import { controllerWrapper } from "../lib/controllerWrapper";
import { filterSchema } from "../lib/schema/filter.schema";
import { response } from "../middlewares/response";
import {
  deleteExistingNotification,
  getAllUserExistingNotifications,
  markAllExistingNotificationAsRead,
  markExistingNotificationAsRead,
  markExistingNotificationAsUnread,
} from "../services/notification-service";

// GET api/notifications
export const getAllNotifications = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);

  const { notifications, total_count } = await getAllUserExistingNotifications({
    userId: req.user.id,
    filters: {
      query,
      page,
      limit,
      orderBy,
      order,
    },
  });

  response.success({
    status: 200,
    message: "Notifications fetched successfully",
    data: notifications,
    total_count,
  });
});

// PATCH api/notifications/markAllAsRead
export const markAllNotificationsAsRead = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  await markAllExistingNotificationAsRead({
    userId: req.user.id,
  });
  response.success({
    status: 200,
    message: "All notifications marked as read successfully",
  });
});

// PATCH api/notification/:id/markAsRead
export const markNotificationAsRead = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Notification id is required",
    });
    return;
  }

  await markExistingNotificationAsRead({
    id: Number(id),
    userId: req.user.id,
  });
  response.success({
    status: 200,
    message: "Notification marked as read successfully",
  });
});

// PATCH api/notification/:id/markAsUnread
export const markNotificationAsUnread = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Notification id is required",
    });
    return;
  }

  await markExistingNotificationAsUnread({
    id: Number(id),
    userId: req.user.id,
  });
  response.success({
    status: 200,
    message: "Notification marked as unread successfully",
  });
});

// DELETE api/notification/:id
export const deleteNotification = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Notification id is required",
    });
    return;
  }

  await deleteExistingNotification({
    id: Number(id),
    userId: req.user.id,
  });
  response.success({
    status: 200,
    message: "Notification deleted successfully",
  });
});
