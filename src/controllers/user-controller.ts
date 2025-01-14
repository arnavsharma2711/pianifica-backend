import { controllerWrapper } from "../lib/controllerWrapper";
import { filterSchema } from "../lib/schema/filter.schema";
import { updateUserSchema } from "../lib/schema/user.schema";
import { response } from "../middlewares/response";
import {
  createNewUser,
  deleteExistingUser,
  getAllUsers,
  checkUserExistsByEmail,
  getExistingUserByUsername,
  updateExistingUser,
  updateExistingUserEmail,
  updateExistingUserPassword,
  updateExistingUserUsername,
} from "../services/user-service";
import { isOrgSuperAdmin } from "../utils/commonUtils";

// POST api/user
export const createUser = controllerWrapper(async (req) => {
  const {
    organizationId,
    firstName,
    lastName,
    username,
    email,
    password,
    profilePictureUrl,
    phone,
    designation,
  } = req.body;

  const user = await createNewUser({
    organizationId,
    firstName,
    lastName,
    email,
    password,
    profilePictureUrl,
    phone,
    username,
    designation,
  });

  response.success({
    status: 201,
    message: "User created successfully",
    data: user,
  });
});

// GET api/users
export const getUsers = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { query, page, limit, orderBy, order, fetchDeleted } =
    filterSchema.parse(req.query);
  const users = await getAllUsers({
    organizationId: req.user.organizationId,

    filters: {
      query,
      page,
      limit,
      orderBy,
      order,
    },
    fetchDeleted: isOrgSuperAdmin(req.user.userRoles) && fetchDeleted,
  });

  response.success({
    status: 200,
    message: "Users fetched successfully",
    data: users,
  });
});

// GET api/user/exists/?email=userEmail
export const checkUserEmailExists = controllerWrapper(async (req) => {
  const email = req.query.email as string;
  if (!email) {
    response.invalid({
      message: "Email is required",
    });
    return;
  }

  const message = await checkUserExistsByEmail({
    email,
  });

  response.success({
    status: 200,
    message,
  });
});

// GET api/user/:username
export const getUserByUsername = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { username } = req.params;
  if (!username) {
    response.invalid({
      message: "User id is required",
    });
    return;
  }

  const user = await getExistingUserByUsername({
    organizationId: req.user.organizationId,
    username,
  });

  response.success({
    status: 200,
    message: "User fetched successfully",
    data: user,
  });
});

// PUT api/user/:id
export const updateUser = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "User id is required",
    });
    return;
  }

  const { firstName, lastName, profilePictureUrl, phone, designation } =
    updateUserSchema.parse(req.body);

  const user = await updateExistingUser({
    id: Number(id),
    firstName,
    lastName,
    profilePictureUrl,
    phone,
    designation,
  });

  response.success({
    status: 200,
    message: "User updated successfully",
    data: user,
  });
});

// PATCH api/user/:id/email
export const updateUserEmail = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "User id is required",
    });
    return;
  }

  const { email } = req.body;
  if (!email) {
    response.invalid({
      message: "Email is required",
    });
    return;
  }

  const user = await updateExistingUserEmail({
    id: Number(id),
    email,
  });

  response.success({
    status: 200,
    message: "User email updated successfully",
    data: user,
  });
});

// PATCH api/user/:id/username
export const updateUserUsername = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "User id is required",
    });
    return;
  }

  const { username } = req.body;
  if (!username) {
    response.invalid({
      message: "Username is required",
    });
    return;
  }

  const user = await updateExistingUserUsername({
    id: Number(id),
    username,
  });

  response.success({
    status: 200,
    message: "User username updated successfully",
    data: user,
  });
});

// PATCH api/user/:id/password
export const updateUserPassword = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "User id is required",
    });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword) {
    response.invalid({
      message: "Current password is required",
    });
    return;
  }
  if (!newPassword) {
    response.invalid({
      message: "New password is required",
    });
    return;
  }

  const user = await updateExistingUserPassword({
    id: Number(id),
    currentPassword,
    newPassword,
  });

  response.success({
    status: 200,
    message: "User password updated successfully",
    data: user,
  });
});

// DELETE api/user/:id
export const deleteUser = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "User id is required",
    });
    return;
  }

  await deleteExistingUser({ id: Number(id) });

  response.success({
    status: 200,
    message: "User deleted successfully",
  });
});
