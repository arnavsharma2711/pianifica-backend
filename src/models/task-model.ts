import type { TaskPriority, TaskStatus, TaskType } from "@prisma/client";
import type { TaskFilter } from "../lib/filters";
import prisma from "../connections/prisma";

// Create

export const createTask = async ({
  projectId,
  parentId,
  title,
  summary,
  type,
  status,
  priority,
  dueDate,
  assigneeId,
  authorId,
}: {
  projectId: number;
  parentId?: number | null;
  title: string;
  summary?: string;
  type: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assigneeId?: number | null;
  authorId: number;
}) => {
  return await prisma.task.create({
    data: {
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
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          profilePictureUrl: true,
        },
      },
      author: {
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
  });
};

// Read

export const getTasks = async ({
  organizationId,
  projectId,
  userId,
  filters,
}: {
  organizationId?: number;
  projectId?: number;
  userId?: number;
  filters: TaskFilter;
}) => {
  const whereClause: {
    AND: {
      deletedAt?: null;
      project?: {
        organizationId: number;
        deletedAt: null;
      };
      projectId?: number;
      OR: {
        assigneeId?: number;
        authorId?: number;
      }[];
      title?: { contains: string } | undefined;
      type?: { equals: TaskType } | undefined;
      status?: { equals: TaskStatus } | undefined;
      priority?: { equals: TaskPriority } | undefined;
    };
  } = {
    AND: {
      deletedAt: null,
      OR: [{ assigneeId: userId }, { authorId: userId }],
    },
  };

  if (organizationId)
    whereClause.AND.project = {
      organizationId,
      deletedAt: null,
    };

  if (projectId) whereClause.AND.projectId = projectId;

  if (filters.query) {
    whereClause.AND.title = {
      contains: filters.query,
    };
  }

  if (filters.type) {
    whereClause.AND.type = {
      equals: filters.type,
    };
  }

  if (filters.status) {
    whereClause.AND.status = {
      equals: filters.status,
    };
  }

  if (filters.priority) {
    whereClause.AND.priority = {
      equals: filters.priority,
    };
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          profilePictureUrl: true,
        },
      },
      author: {
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
  });

  const total_count = await prisma.task.count({
    where: whereClause,
  });

  return {
    tasks,
    total_count,
  };
};

export const getTasksByParentId = async ({
  parentId,
}: {
  parentId: number;
}) => {
  return await prisma.task.findMany({
    where: { parentId, deletedAt: null },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          profilePictureUrl: true,
        },
      },
      author: {
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
  });
};

export const getTaskById = async ({
  id,
  organizationId,
}: {
  id: number;
  organizationId: number;
}) => {
  return await prisma.task.findUnique({
    where: {
      id,
      project: {
        organizationId,
      },
      deletedAt: null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          profilePictureUrl: true,
        },
      },
      author: {
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
  });
};

export const getSubTasksCountByTaskId = async ({
  taskId,
}: {
  taskId: number;
}) => {
  return await prisma.task.count({
    where: {
      parentId: taskId,
    },
  });
};

// Update

export const updateTask = async ({
  id,
  updateBody,
}: {
  id: number;
  updateBody: {
    projectId?: number;
    parentId?: number;
    title?: string;
    summary?: string;
    type?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date;
    assigneeId?: number;
  };
}) => {
  return await prisma.task.update({
    where: { id },
    data: updateBody,
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          profilePictureUrl: true,
        },
      },
      author: {
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
  });
};

// Delete

export const deleteTask = async ({ id }: { id: number }) => {
  return await prisma.task.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
