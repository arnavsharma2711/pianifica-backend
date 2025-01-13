import * as userTokenModel from "../models/user-token-model";
import * as userModel from "../models/user-model";
import { CustomError } from "../lib/error/custom.error";
import { generateToken } from "../utils/commonUtils";

export const generateUserToken = async ({
  email,
  type,
}: {
  email: string;
  type: "VERIFY_EMAIL" | "RESET_PASSWORD";
}) => {
  const user = await userModel.getUserByEmail({ email });

  if (!user) {
    throw new CustomError(404, "User not found");
  }
  const token = await generateToken(
    {
      id: user.id,
      email,
      organizationId: user.organizationId,
    },
    "1h"
  );
  await userTokenModel.upsertUserToken({
    userId: user.id,
    token,
    type,
    expiresAt: new Date(Date.now() + 3600000),
  });

  return token;
};

export const verifyUserToken = async ({
  userId,
  type,
}: {
  userId: number;
  type: "VERIFY_EMAIL" | "RESET_PASSWORD";
}) => {
  const userToken = await userTokenModel.getUserTokenByUserId({
    userId,
    type,
  });

  if (!userToken) {
    throw new CustomError(404, "User not found");
  }

  if (userToken.expiresAt < new Date()) {
    throw new CustomError(401, "Token expired");
  }

  return true;
};
