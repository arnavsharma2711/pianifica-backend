import { CustomError } from "../lib/error/custom.error";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import * as commentModel from "../models/comment-model";
import {
  generateTaskAssigneeNotification,
  getExistingTaskById,
} from "./task-service";

export const createNewComment = async ({
  organizationId,
  taskId,
  userId,
  content,
}: {
  organizationId: number;
  taskId: number;
  userId: number;
  content: string;
}) => {
  const task = await getExistingTaskById({ id: taskId, organizationId });
  const comment = await commentModel.createComment({
    taskId,
    userId,
    content,
  });

  generateTaskAssigneeNotification({
    taskId,
    status: "CommentAdded",
    variables: { "<task_title>": task.title },
  });

  return comment;
};

export const getExistingCommentsByTaskId = async ({
  taskId,
  organizationId,
  filters,
}: {
  taskId: number;
  organizationId: number;
  filters: FilterOptions;
}) => {
  await getExistingTaskById({ id: taskId, organizationId });
  const { comments, total_count } = await commentModel.getCommentsByTaskId({
    taskId,
    filters: getDefaultFilter(filters),
  });

  return { comments: comments.map((comment) => comment), total_count };
};

export const getExistingCommentById = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  const comment = await commentModel.getCommentById({ id, userId });

  if (!comment) {
    throw new CustomError(404, "Comment not found");
  }

  return comment;
};

export const updateExistingComment = async ({
  id,
  content,
  updatedBy,
}: {
  id: number;
  content: string;
  updatedBy: number;
}) => {
  const comment = await getExistingCommentById({ id, userId: updatedBy });
  if (comment.content === content) {
    return comment;
  }
  const updatedComment = await commentModel.updateComment({ id, content });

  return updatedComment;
};

export const deleteExistingComment = async ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) => {
  const comment = await getExistingCommentById({ id, userId });

  if (comment.userId !== userId) {
    throw new CustomError(
      403,
      "You do not have permission to delete this comment",
    );
  }
  await commentModel.deleteComment({ id });
};
