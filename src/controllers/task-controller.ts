import { controllerWrapper } from "../lib/controllerWrapper";
import { filterSchema, taskFilterSchema } from "../lib/schema/filter.schema";
import { createTaskSchema, updateTaskSchema } from "../lib/schema/task.schema";
import { response } from "../middlewares/response";
import {
  addNewBookmark,
  deleteExistingBookmark,
} from "../services/bookmark-service";
import { getExistingCommentsByTaskId } from "../services/comment-service";
import { getTaskActivityByTaskId } from "../services/task-activity-service";
import {
  createNewTask,
  deleteExistingTask,
  getExistingTaskById,
  getExistingTasksByOrganizationId,
  getExistingTasksByParentId,
  migrateTaskToProject,
  updateExistingTask,
} from "../services/task-service";

// POST api/task
export const createTask = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const {
    projectId,
    parentId,
    title,
    type,
    summary,
    status,
    priority,
    dueDate,
    assigneeId,
  } = createTaskSchema.parse(req.body);

  const task = await createNewTask({
    organizationId: req.user.organizationId,
    projectId,
    parentId,
    title,
    type,
    summary,
    status,
    priority,
    dueDate,
    assigneeId,
    authorId: req.user.id,
  });

  response.success({
    status: 201,
    message: "Task created successfully",
    data: task,
  });
});

// POST api/task/:id/migrate
export const migrateTask = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await migrateTaskToProject({
    id: Number(id),
    organizationId: req.user.organizationId,
    projectId: Number(req.body.projectId),
    updatedBy: req.user.id,
  });

  response.success({
    status: 200,
    message: "Task migrated successfully",
    data: task,
  });
});

// GET api/task/:id
export const getTask = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await getExistingTaskById({
    id: Number(id),
    organizationId: req.user.organizationId,
    getComments: true,
    userId: req.user.id,
  });

  response.success({
    status: 200,
    message: "Task fetched successfully",
    data: task,
  });
});

// GET api/tasks
export const getTasks = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { query, page, limit, orderBy, order, type, status, priority, userId } =
    taskFilterSchema.parse(req.query);

  const tasks = await getExistingTasksByOrganizationId({
    organizationId: req.user.organizationId,
    userId,
    filters: {
      query,
      page,
      limit,
      orderBy,
      order,
      type,
      status,
      priority,
    },
  });

  response.success({
    status: 200,
    message: "Tasks fetched successfully",
    data: tasks,
  });
});

// GET api/tasks/:id/subTasks
export const getSubTasks = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const tasks = await getExistingTasksByParentId({
    parentId: Number(id),
    organizationId: req.user.organizationId,
  });

  response.success({
    status: 200,
    message: "Sub tasks fetched successfully",
    data: tasks,
  });
});

// GET api/tasks/:id/activity
export const getTaskActivity = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const activities = await getTaskActivityByTaskId({
    taskId: Number(id),
    organizationId: req.user.organizationId,
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
    message: "Task activity fetched successfully",
    data: activities,
  });
});

// GET api/task/:id/comments
export const getCommentsByTaskId = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { taskId } = req.params;
  if (!taskId) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }
  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const { comments, total_count } = await getExistingCommentsByTaskId({
    taskId: Number(taskId),
    organizationId: req.user.organizationId,
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
    message: "Comments fetched successfully",
    data: comments,
    total_count,
  });
});

// POST api/task/:id/bookmark
export const bookmarkTask = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;

  await addNewBookmark({
    userId: req.user.id,
    organizationId: req.user.organizationId,
    entityType: "Task",
    entityId: Number(id),
  });

  response.success({
    status: 200,
    message: "Task bookmarked successfully",
  });
});

// DELETE api/task/:id/bookmark
export const deleteBookmark = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;

  await deleteExistingBookmark({
    userId: req.user.id,
    entityType: "Task",
    entityId: Number(id),
  });

  response.success({
    status: 200,
    message: "Task bookmark deleted successfully",
  });
});

// PATCH api/task/:id/title
export const updateTaskTitle = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;
  const { title } = updateTaskSchema.parse(req.body);
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await updateExistingTask({
    id: Number(id),
    updateBody: {
      title,
    },
    updating: "title",
    updatedBy: req.user.id,
    organizationId: req.user.organizationId,
  });

  return response.success({
    message: "Task title updated successfully",
    data: task,
  });
});

// PATCH api/task/:id/summary
export const updateTaskSummary = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;
  const { summary } = updateTaskSchema.parse(req.body);
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await updateExistingTask({
    id: Number(id),
    updateBody: {
      summary,
    },
    updating: "summary",
    updatedBy: req.user.id,
    organizationId: req.user.organizationId,
  });

  return response.success({
    message: "Task summary updated successfully",
    data: task,
  });
});

// PATCH api/task/:id/status
export const updateTaskStatus = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;
  const { status } = updateTaskSchema.parse(req.body);
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await updateExistingTask({
    id: Number(id),
    updateBody: {
      status,
    },
    updating: "status",
    updatedBy: req.user.id,
    organizationId: req.user.organizationId,
  });

  return response.success({
    message: "Task status updated successfully",
    data: task,
  });
});

// PATCH api/task/:id/priority
export const updateTaskPriority = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;
  const { priority } = updateTaskSchema.parse(req.body);
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await updateExistingTask({
    id: Number(id),
    updateBody: {
      priority,
    },
    updating: "priority",
    updatedBy: req.user.id,
    organizationId: req.user.organizationId,
  });

  return response.success({
    message: "Task priority updated successfully",
    data: task,
  });
});

// PATCH api/task/:id/dueDate
export const updateTaskDueDate = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;
  const { dueDate } = updateTaskSchema.parse(req.body);
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await updateExistingTask({
    id: Number(id),
    updateBody: {
      dueDate,
    },
    updating: "dueDate",
    updatedBy: req.user.id,
    organizationId: req.user.organizationId,
  });

  return response.success({
    message: "Task due date updated successfully",
    data: task,
  });
});

// PATCH api/task/:id/assignee
export const updateTaskAssignee = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;
  const { assigneeId } = updateTaskSchema.parse(req.body);
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await updateExistingTask({
    id: Number(id),
    updateBody: {
      assigneeId,
    },
    updating: "assigneeId",
    updatedBy: req.user.id,
    organizationId: req.user.organizationId,
  });

  return response.success({
    message: "Task assignee updated successfully",
    data: task,
  });
});

// DELETE api/task/:id
export const deleteTask = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Task id is required",
    });
    return;
  }

  const task = await deleteExistingTask({
    id: Number(id),
    organizationId: req.user.organizationId,
    deletedBy: req.user.id,
  });

  response.success({
    status: 200,
    message: "Task deleted successfully",
    data: task,
  });
});
