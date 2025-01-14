import type { TokenType } from "@prisma/client";
import prisma from "../connections/prisma";

// Create
export const upsertUserToken = async ({
  userId,
  token,
  type,
  expiresAt,
}: {
  userId: number;
  token: string;
  type: TokenType;
  expiresAt: Date;
}) => {
  return await prisma.userToken.upsert({
    where: { userId_type: { userId, type } },
    update: {
      token,
      expiresAt,
    },
    create: {
      userId,
      token,
      type,
      expiresAt,
    },
  });
};

// Read

export const getUserTokenByUserId = async ({
  userId,
  type,
}: {
  userId: number;
  type: TokenType;
}) => {
  return await prisma.userToken.findFirst({
    where: { userId, type },
  });
};

// Delete
export const deleteUserToken = async ({
  userId,
  type,
}: {
  userId: number;
  type: TokenType;
}) => {
  return await prisma.userToken.update({
    where: { userId_type: { userId, type } },
    data: { expiresAt: new Date() },
  });
};
