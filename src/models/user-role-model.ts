import prisma from "../connections/prisma";

// Create

export const createUserRole = async ({
  userId,
  role,
}: {
  userId: number;
  role: "SUPER_ADMIN" | "ORG_SUPER_ADMIN" | "ORG_ADMIN" | "ORG_MEMBER";
}) => {
  return await prisma.userRole.create({
    data: {
      userId,
      role,
    },
  });
};

// Read

export const getUserRoleByUserId = async ({ userId }: { userId: number }) => {
  return await prisma.userRole.findMany({
    where: { userId },
  });
};

// Delete

export const deleteUserRole = async ({
  userId,
  role,
}: {
  userId: number;
  role: "SUPER_ADMIN" | "ORG_ADMIN" | "ORG_MEMBER";
}) => {
  return await prisma.userRole.delete({
    where: { userId_role: { userId, role } },
  });
};
