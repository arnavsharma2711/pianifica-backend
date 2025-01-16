import prisma from "../connections/prisma";
import type { Filter } from "../lib/filters";

// Create

export const createComment = async ({
  taskId,
  userId,
  content,
}: {
  taskId: number;
  userId: number;
  content: string;
}) => {
  return await prisma.comment.create({
    data: {
      taskId,
      userId,
      content,
    },
  });
};

// Read

export const getCommentsByTaskId = async ({
  taskId,
  filters,
}: {
  taskId: number;
  filters: Filter;
}) => {
  const comments = await prisma.comment.findMany({
    where: {
      deletedAt: null,
      taskId,
    },
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const total_count = await prisma.comment.count({
    where: {
      deletedAt: null,
      taskId,
    },
  });

  return {
    comments,
    total_count,
  };
};

export const getCommentById = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  return await prisma.comment.findUnique({
    where: { id, userId, deletedAt: null },
  });
};

// Update

export const updateComment = async ({
  id,
  content,
}: {
  id: number;
  content?: string;
}) => {
  return await prisma.comment.update({
    where: { id },
    data: { content },
  });
};

// Delete

export const deleteComment = async ({ id }: { id: number }) => {
  return await prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
