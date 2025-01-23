import { CustomError } from "../lib/error/custom.error";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import { projectSchema } from "../lib/schema/project.schema";
import { taskSchema } from "../lib/schema/task.schema";
import * as bookmarkModel from "../models/bookmark-model";
import { getExistingProjectById } from "./project-service";
import { getExistingTaskById } from "./task-service";

export const addNewBookmark = async ({
  userId,
  organizationId,
  entityType,
  entityId,
}: {
  userId: number;
  organizationId: number;
  entityType: "Task" | "Project";
  entityId: number;
}) => {
  if (entityType === "Task")
    await getExistingTaskById({ id: entityId, organizationId });
  else await getExistingProjectById({ id: entityId, organizationId });

  const existingBookmark = await bookmarkModel.getBookmarkByEntity({
    userId,
    entityType,
    entityId,
  });

  if (existingBookmark) {
    throw new CustomError(400, "Bookmark already exists");
  }

  const bookmark = await bookmarkModel.createBookmark({
    userId,
    entityType,
    entityId,
  });

  return bookmark;
};

export const getExistingBookmarkedTasks = async ({
  userId,
  filters,
}: {
  userId: number;
  filters: FilterOptions;
}) => {
  const { bookmarks, total_count } = await bookmarkModel.getBookmarkedTasks({
    userId,
    filters: getDefaultFilter(filters),
  });

  return {
    bookmarks: bookmarks.map((bookmark) => taskSchema.parse(bookmark.task)),
    total_count,
  };
};

export const getExistingBookmarkedProjects = async ({
  userId,
  filters,
}: {
  userId: number;
  filters: FilterOptions;
}) => {
  const { bookmarks, total_count } = await bookmarkModel.getBookmarkedProjects({
    userId,
    filters: getDefaultFilter(filters),
  });

  return {
    bookmarks: bookmarks.map((bookmark) =>
      projectSchema.parse(bookmark.project),
    ),
    total_count,
  };
};

export const deleteExistingBookmark = async ({
  userId,
  entityType,
  entityId,
}: {
  userId: number;
  entityType: "Task" | "Project";
  entityId: number;
}) => {
  const bookmark = await bookmarkModel.getBookmarkByEntity({
    userId,
    entityType,
    entityId,
  });

  if (!bookmark) {
    throw new CustomError(404, "Bookmark not found");
  }

  await bookmarkModel.deleteBookmark({ id: bookmark.id });
};
