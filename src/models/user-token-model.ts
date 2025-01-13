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
  type: "RESET_PASSWORD" | "VERIFY_EMAIL";
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
  type: "RESET_PASSWORD" | "VERIFY_EMAIL";
}) => {
  return await prisma.userToken.findFirst({
    where: { userId, type },
  });
};
