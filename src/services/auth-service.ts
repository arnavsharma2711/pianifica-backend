import type { User } from "@prisma/client";
import { CustomError } from "../lib/error/custom.error";
import { userSchema } from "../lib/schema/user.schema";
import * as userModel from "../models/user-model";
import { generateToken } from "../utils/commonUtils";
import { generateUserToken, verifyUserToken } from "./user-token-service";
import { sendVerifyMailService } from "./mailer-service";

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

  const access_token = await generateToken(
    {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    },
    "6h"
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

  await sendVerifyMailService(email, token);

  return token;
};

export const resetPassword = async ({
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

  const token = await generateUserToken({
    email,
    type: "VERIFY_EMAIL",
  });

  return { token };
};

export const verifyEmail = async ({ userId }: { userId: number }) => {
  const userToken = await verifyUserToken({ userId, type: "VERIFY_EMAIL" });

  if (!userToken) {
    throw new CustomError(401, "Invalid token");
  }

  await userModel.updateUser({
    id: userId,
    verifiedAt: new Date(),
  });

  return "Email verified successfully";
};
