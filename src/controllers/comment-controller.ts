import { controllerWrapper } from "../lib/controllerWrapper";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../lib/schema/comment.schema";
import { response } from "../middlewares/response";
import {
  createNewComment,
  deleteExistingComment,
  updateExistingComment,
} from "../services/comment-service";

// POST api/comment
export const createComment = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { taskId, content } = createCommentSchema.parse(req.body);

  const comment = await createNewComment({
    organizationId: req.user.organizationId,
    taskId,
    content,
    userId: req.user.id,
  });

  response.success({
    status: 201,
    message: "Comment created successfully",
    data: comment,
  });
});

// PATCH api/comment/:id/content
export const updateCommentContent = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Comment id is required",
    });
    return;
  }

  const { content } = updateCommentSchema.parse(req.body);

  const comment = await updateExistingComment({
    id: Number(id),
    content,
    updatedBy: req.user.id,
  });

  response.success({
    status: 200,
    message: "Comment content updated successfully",
    data: comment,
  });
});

// DELETE api/comment/:id
export const deleteComment = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Comment id is required",
    });
    return;
  }

  await deleteExistingComment({
    id: Number(id),
    userId: req.user.id,
  });

  response.success({
    status: 200,
    message: "Comment deleted successfully",
  });
});
