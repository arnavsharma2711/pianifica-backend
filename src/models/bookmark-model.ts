import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createBookmark = async ({
  userId,
  entityType,
  entityId,
}: {
  userId: number;
  entityType: string;
  entityId: number;
}) => {
  return await prisma.bookmark.create({
    data: {
      userId,
      projectId: entityType === "Project" ? entityId : null,
      taskId: entityType === "Task" ? entityId : null,
    },
  });
};

// Read
export const getBookmarkedTasks = async ({
  userId,
  filters,
}: {
  userId: number;
  filters: Filter;
}) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      taskId: {
        not: null,
      },
    },
    include: {
      task: {
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
      },
    },
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.bookmark.count({
    where: {
      userId,
      taskId: {
        not: null,
      },
    },
  });

  return {
    bookmarks,
    total_count,
  };
};

export const getBookmarkedProjects = async ({
  userId,
  filters,
}: {
  userId: number;
  filters: Filter;
}) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      projectId: {
        not: null,
      },
    },
    include: {
      project: true,
    },
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.bookmark.count({
    where: {
      userId,
      projectId: {
        not: null,
      },
    },
  });

  return {
    bookmarks,
    total_count,
  };
};

export const getBookmarkByEntity = async ({
  entityType,
  entityId,
  userId,
}: {
  entityType: string;
  entityId: number;
  userId: number;
}) => {
  return await prisma.bookmark.findFirst({
    where: {
      userId,
      OR: [
        { taskId: entityType === "Task" ? entityId : undefined },
        { projectId: entityType === "Project" ? entityId : undefined },
      ],
    },
  });
};

// Delete

export const deleteBookmark = async ({ id }: { id: number }) => {
  return await prisma.bookmark.delete({
    where: { id },
  });
};
