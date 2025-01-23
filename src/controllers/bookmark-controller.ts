import { controllerWrapper } from "../lib/controllerWrapper";
import { filterSchema } from "../lib/schema/filter.schema";
import { response } from "../middlewares/response";
import {
  getExistingBookmarkedProjects,
  getExistingBookmarkedTasks,
} from "../services/bookmark-service";

// GET /api/bookmark/projects
export const getBookmarkedProjects = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const { bookmarks, total_count } = await getExistingBookmarkedProjects({
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
    message: "Bookmarked projects fetched successfully",
    data: bookmarks,
    total_count,
  });
});

// GET /api/bookmark/tasks
export const getBookmarkedTasks = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const { bookmarks, total_count } = await getExistingBookmarkedTasks({
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
    message: "Bookmarked tasks fetched successfully",
    data: bookmarks,
    total_count,
  });
});
