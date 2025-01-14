import type { User } from "@prisma/client";
import { CustomError } from "../lib/error/custom.error";
import { userSchema } from "../lib/schema/user.schema";
import * as userModel from "../models/user-model";
import { generateToken } from "../utils/commonUtils";
import {
  deleteUserToken,
  generateUserToken,
  verifyUserToken,
} from "./user-token-service";
import {
  sendResetPasswordMailService,
  sendVerifyMailService,
} from "./mailer-service";

export const validateUserCredentials = async ({
  identifier,
  password,
}: {
  identifier: string;
  password: string;
}) => {
  let user: User | null = null;

  if (identifier.includes("@")) {
    user = await userModel.getUserByEmail({
      email: identifier,
    });
  } else {
    user = await userModel.getUserByUsername({
      username: identifier,
    });
  }

  if (!user) {
    throw new CustomError(401, "Invalid credentials");
  }

  const isValidPassword = await userModel.verifyPassword({
    id: user.id,
    password,
  });

  if (!isValidPassword) {
    throw new CustomError(401, "Invalid credentials");
  }

  await userModel.updateLastLogin({ id: user.id });

  const access_token = await generateToken(
    {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    },
    "6h",
  );

  return { user: userSchema.parse(user), access_token };
};

export const generateResetPasswordToken = async ({
  email,
}: {
  email: string;
}) => {
  const user = await userModel.getUserByEmail({ email });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  const token = await generateUserToken({
    email,
    type: "RESET_PASSWORD",
  });

  await sendResetPasswordMailService(email, token);

  return token;
};

export const verifyResetPasswordToken = async ({
  userId,
  newPassword,
}: {
  userId: number;
  newPassword: string;
}) => {
  const userToken = await verifyUserToken({ userId, type: "RESET_PASSWORD" });

  if (!userToken) {
    throw new CustomError(401, "Invalid token");
  }

  await userModel.updateUserPassword({
    id: userId,
    password: newPassword,
  });

  await deleteUserToken({ userId, type: "RESET_PASSWORD" });

  return "Password reset successfully";
};

export const generateVerifyEmailToken = async ({
  email,
}: {
  email: string;
}) => {
  const user = await userModel.getUserByEmail({ email });

  if (!user) {
    throw new CustomError(404, "User not found");
  }

  if (user.verifiedAt) {
    throw new CustomError(400, "Email already verified");
  }

  const token = await generateUserToken({
    email,
    type: "VERIFY_EMAIL",
  });

  await sendVerifyMailService(email, token);

  return token;
};

export const verifyEmailToken = async ({ userId }: { userId: number }) => {
  const userToken = await verifyUserToken({ userId, type: "VERIFY_EMAIL" });

  if (!userToken) {
    throw new CustomError(401, "Invalid token");
  }

  await userModel.updateUser({
    id: userId,
    verifiedAt: new Date(),
  });

  await deleteUserToken({ userId, type: "VERIFY_EMAIL" });

  return "Email verified successfully";
};
