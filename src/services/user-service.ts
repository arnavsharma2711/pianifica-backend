import type { Role, User } from "@prisma/client";
import { CustomError } from "../lib/error/custom.error";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import { userSchema } from "../lib/schema/user.schema";
import * as userModel from "../models/user-model";
import * as userRoleModel from "../models/user-role-model";
import { generateVerifyEmailToken } from "./auth-service";

export const createNewUser = async ({
  organizationId,
  firstName,
  lastName,
  email,
  password,
  profilePictureUrl,
  phone,
  username,
  designation,
  role = "ORG_MEMBER",
}: {
  organizationId: number;
  firstName: string;
  lastName?: string;
  username: string;
  email: string;
  password: string;
  profilePictureUrl?: string;
  phone?: string;
  designation?: string;
  role?: Role;
}) => {
  const existingUserByEmail = await userModel.getUserByEmail({
    email,
    organizationId,
  });
  if (existingUserByEmail) {
    throw new CustomError(400, "User with this email already exists");
  }

  const existingUserByUsername = await userModel.getUserByUsername({
    username,
    organizationId,
  });
  if (existingUserByUsername) {
    throw new CustomError(400, "User with this username already exists");
  }

  const user = await userModel.createUser({
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

  await userRoleModel.createUserRole({
    userId: user.id,
    role,
  });

  await generateVerifyEmailToken({ email });

  return userSchema.parse(user);
};

export const getAllUsers = async ({
  organizationId,
  filters,
}: {
  organizationId: number;
  filters: FilterOptions;
}) => {
  const { users, totalCount } = await userModel.getUsers({
    organizationId,
    filters: getDefaultFilter(filters),
    fetchDeleted: false,
  });

  const usersData = users.map((user) => userSchema.parse(user));

  return { usersData, totalCount };
};

export const getExistingUser = async ({
  id,
  email,
  username,
  organizationId,
}: {
  id?: number;
  email?: string;
  username?: string;
  organizationId?: number;
}) => {
  let user: User | null = null;
  if (id) {
    user = await userModel.getUserById({ id, organizationId });
  }
  if (email) {
    user = await userModel.getUserByEmail({ email, organizationId });
  }
  if (username) {
    user = await userModel.getUserByUsername({ username, organizationId });
  }

  return user;
};

export const getExistingUserById = async ({ id }: { id: number }) => {
  const user = await userModel.getUserById({ id });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  return user;
};

export const getExistingUserByEmail = async ({ email }: { email: string }) => {
  const user = await userModel.getUserByEmail({ email });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  return userSchema.parse(user);
};

export const getExistingUserByUsername = async ({
  organizationId,
  username,
}: {
  organizationId: number;
  username: string;
}) => {
  const user = await userModel.getUserByUsername({ username, organizationId });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  return userSchema.parse(user);
};

export const checkUserExistsByEmail = async ({ email }: { email: string }) => {
  const user = await userModel.getUserByEmail({ email });
  if (user) {
    throw new CustomError(400, "User with this email already exists");
  }
  return "User does not exist";
};

export const updateExistingUser = async (updateBody: {
  id: number;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  phone?: string;
  designation?: string;
}) => {
  const user = await userModel.updateUser(updateBody);

  return userSchema.parse(user);
};

export const updateExistingUserEmail = async ({
  id,
  email,
}: {
  id: number;
  email: string;
}) => {
  const user = await userModel.updateUserEmail({ id, email });

  return userSchema.parse(user);
};

export const updateExistingUserUsername = async ({
  id,
  username,
}: {
  id: number;
  username: string;
}) => {
  const user = await userModel.updateUserUsername({ id, username });

  return userSchema.parse(user);
};

export const updateExistingUserPassword = async ({
  id,
  currentPassword,
  newPassword,
}: {
  id: number;
  currentPassword: string;
  newPassword: string;
}) => {
  const isValidPassword = await userModel.verifyPassword({
    id,
    password: currentPassword,
  });
  if (!isValidPassword) {
    throw new CustomError(400, "Invalid password");
  }

  const user = await userModel.updateUserPassword({
    id,
    password: newPassword,
  });

  return userSchema.parse(user);
};

export const deleteExistingUser = async ({ id }: { id: number }) => {
  await userModel.getUserById({ id });
  await userModel.deleteUser({ id });
};
