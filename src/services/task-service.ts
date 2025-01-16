import type { TaskPriority, TaskStatus, TaskType, User } from "@prisma/client";
import { CustomError } from "../lib/error/custom.error";
import { getProjectById } from "../models/project-model";
import * as taskModel from "../models/task-model";
import { getDefaultTaskFilters, type TaskFilterOptions } from "../lib/filters";
import { taskSchema } from "../lib/schema/task.schema";
import { getExistingUserById } from "./user-service";
import {
  createMultipleNotifications,
  createNewNotification,
} from "./notification-service";
import { getExistingProjectById } from "./project-service";
import {
  createTaskActivity,
  getTaskActivityByTaskIdAndAction,
} from "./task-activity-service";

const generateTaskAssigneeNotification = async ({
  taskId,
  status,
  variables,
}: {
  taskId: number;
  status: string;
  variables: Record<string, string>;
}) => {
  const result = await getTaskActivityByTaskIdAndAction({
    taskId,
    actionType: "update",
    actionOn: "assigneeId",
  });
  const userIdsSet: Set<number> = new Set();
  for (const record of result) {
    userIdsSet.add(record.userId);
    userIdsSet.add(Number(record.previousValue));
    userIdsSet.add(Number(record.updatedValue));
  }

  if (userIdsSet.size > 0) {
    await createMultipleNotifications({
      userIds: Array.from(userIdsSet),
      notifiableType: "Task",
      notifiableId: taskId,
      status,
      variables,
    });
  }
};

export const createNewTask = async ({
  organizationId,
  projectId,
  parentId,
  title,
  type,
  summary,
  status,
  priority,
  dueDate,
  assigneeId,
  authorId,
}: {
  organizationId: number;
  projectId: number;
  parentId?: number | null;
  title: string;
  type: TaskType;
  summary?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assigneeId?: number | null;
  authorId: number;
}) => {
  await getProjectById({ id: projectId, organizationId });

  if (parentId) {
    const parentTask = await taskModel.getTaskById({
      id: parentId,
      organizationId,
    });
    if (!parentTask) {
      throw new CustomError(400, "Parent task not found");
    }
  }
  let assignee: User | null = null;

  if (assigneeId) {
    assignee = await getExistingUserById({
      id: assigneeId,
      organizationId,
    });
  }

  const task = await taskModel.createTask({
    projectId,
    parentId,
    title,
    type,
    summary,
    status,
    priority,
    dueDate,
    assigneeId,
    authorId,
  });

  createNewNotification({
    userId: authorId,
    notifiableType: "Task",
    notifiableId: task.id,
    status: "Created",
    variables: {
      "<task_title>": task.title,
    },
  });

  if (assignee) {
    createNewNotification({
      userId: assignee.id,
      notifiableType: "Task",
      notifiableId: task.id,
      status: "Assigned",
      variables: {
        "<task_title>": task.title,
      },
    });
  }

  return taskSchema.parse(task);
};

export const getExistingTasksByOrganizationId = async ({
  organizationId,
  userId,
  filters,
}: {
  organizationId: number;
  userId?: number;
  filters: TaskFilterOptions;
}) => {
  const { tasks, total_count } = await taskModel.getTasks({
    organizationId,
    userId,
    filters: getDefaultTaskFilters(filters),
  });

  return { tasks: tasks.map((task) => taskSchema.parse(task)), total_count };
};

export const getExistingTasksByProjectId = async ({
  projectId,
  organizationId,
  filters,
}: {
  projectId: number;
  organizationId: number;
  filters: TaskFilterOptions;
}) => {
  await getExistingProjectById({ id: projectId, organizationId });
  const { tasks, total_count } = await taskModel.getTasks({
    projectId,
    filters: getDefaultTaskFilters(filters),
  });

  return { tasks: tasks.map((task) => taskSchema.parse(task)), total_count };
};

export const getExistingTasksByParentId = async ({
  parentId,
  organizationId,
}: {
  parentId: number;
  organizationId: number;
}) => {
  await getExistingTaskById({ id: parentId, organizationId });

  const tasks = await taskModel.getTasksByParentId({ parentId });

  return tasks.map((task) => taskSchema.parse(task));
};

export const getExistingTaskById = async ({
  id,
  organizationId,
}: {
  id: number;
  organizationId: number;
}) => {
  const task = await taskModel.getTaskById({ id, organizationId });

  if (!task) {
    throw new CustomError(404, "Task not found");
  }

  return taskSchema.parse(task);
};

export const migrateTaskToProject = async ({
  id,
  organizationId,
  projectId,
  updatedBy,
}: {
  id: number;
  organizationId: number;
  projectId: number;
  updatedBy: number;
}) => {
  const task = await getExistingTaskById({ id, organizationId });
  if (task.project.id === projectId) {
    throw new CustomError(400, "Task already assigned to project");
  }

  if (
    (await taskModel.getSubTasksCountByTaskId({
      taskId: task.id,
    })) > 0
  ) {
    throw new CustomError(400, "Task has sub tasks, cannot be migrated");
  }

  await getExistingProjectById({ id: projectId, organizationId });

  const updatedTask = await taskModel.updateTask({
    id,
    updateBody: {
      projectId,
    },
  });

  createTaskActivity({
    taskId: updatedTask.id,
    userId: updatedBy,
    actionType: "migrate",
    actionOn: "projectId",
    previousValue: task.project.id.toString(),
    updatedValue: projectId.toString(),
  });

  generateTaskAssigneeNotification({
    taskId: updatedTask.id,
    status: "Migrated",
    variables: {
      "<task_title>": updatedTask.title,
      "<project_name>": updatedTask.project.name,
    },
  });

  return taskSchema.parse(updatedTask);
};

export const updateExistingTask = async ({
  id,
  updatedBy,
  updateBody,
  updating,
  organizationId,
}: {
  id: number;
  organizationId: number;
  updatedBy: number;
  updating:
    | "title"
    | "summary"
    | "type"
    | "status"
    | "priority"
    | "dueDate"
    | "assigneeId";
  updateBody: {
    title?: string;
    summary?: string;
    type?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date;
    assigneeId?: number;
  };
}) => {
  const existingTask = await getExistingTaskById({ id, organizationId });

  let previousValue =
    existingTask[
      updating as
        | "title"
        | "summary"
        | "type"
        | "status"
        | "priority"
        | "dueDate"
    ]?.toString();
  const updatedValue = updateBody[updating]?.toString();

  if (updateBody.assigneeId) {
    await getExistingUserById({
      id: updateBody.assigneeId,
      organizationId,
    });

    previousValue = existingTask.assignee?.id.toString();
  }

  if (previousValue === updatedValue) {
    throw new CustomError(400, `Task ${updating} is already ${updatedValue}`);
  }

  const updatedTask = await taskModel.updateTask({
    id,
    updateBody,
  });

  createTaskActivity({
    taskId: updatedTask.id,
    userId: updatedBy,
    actionType: "update",
    actionOn: updating,
    previousValue,
    updatedValue,
  });

  if (updating === "assigneeId" && updateBody.assigneeId) {
    createNewNotification({
      userId: updateBody.assigneeId,
      notifiableType: "Task",
      notifiableId: updatedTask.id,
      status: "Assigned",
      variables: {
        "<task_title>": updatedTask.title,
      },
    });

    if (existingTask.assignee?.id)
      createNewNotification({
        userId: existingTask.assignee.id,
        notifiableType: "Task",
        notifiableId: updatedTask.id,
        status: "Unassigned",
        variables: {
          "<task_title>": updatedTask.title,
        },
      });
  }

  generateTaskAssigneeNotification({
    taskId: updatedTask.id,
    status: "Updated",
    variables: {
      "<task_title>": updatedTask.title,
    },
  });

  return taskSchema.parse(updatedTask);
};

export const deleteExistingTask = async ({
  id,
  organizationId,
  deletedBy,
}: {
  id: number;
  organizationId: number;
  deletedBy: number;
}) => {
  const existingTask = await getExistingTaskById({ id, organizationId });

  createTaskActivity({
    taskId: existingTask.id,
    userId: deletedBy,
    actionType: "deleted",
    actionOn: "task",
  });

  await taskModel.deleteTask({ id });
};
