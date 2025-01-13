import prisma from "../connections/prisma";
import bcrypt from "bcrypt";
import type { Filter } from "../lib/filters";

// Create

export const createUser = async ({
  organizationId,
  firstName,
  lastName,
  email,
  password,
  profilePictureUrl,
  phone,
  username,
  designation,
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
}) => {
  const newUser = await prisma.user.create({
    data: {
      organizationId,
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 10),
      profilePictureUrl: profilePictureUrl,
      phone,
      username,
      designation,
    },
  });

  return newUser;
};

// Read

export const getUsers = async ({
  organizationId,
  filters,
  fetchDeleted = false,
}: {
  organizationId: number;
  filters: Filter;
  fetchDeleted?: boolean;
}) => {
  const whereClause: {
    AND: {
      deletedAt?: null;
      organizationId: number;
      OR?: {
        username?: { contains: string };
        email?: { contains: string };
        firstName?: { contains: string };
        lastName?: { contains: string };
      }[];
    };
  } = {
    AND: {
      deletedAt: fetchDeleted ? undefined : null,
      organizationId,
    },
  };

  if (filters.query) {
    whereClause.AND.OR = [
      { firstName: { contains: filters.query } },
      { lastName: { contains: filters.query } },
      { username: { contains: filters.query } },
      { email: { contains: filters.query } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    take: filters.limit,
    skip: filters.limit * (filters.page - 1),
    orderBy: { [filters.orderBy]: filters.order },
  });

  const totalCount = await prisma.user.count({
    where: whereClause,
  });

  return { users, totalCount };
};

export const getUserById = async ({
  id,
  organizationId,
}: {
  id: number;
  organizationId?: number;
}) => {
  const queryParameters: {
    deletedAt: null;
    id: number;
    organizationId?: number;
  } = {
    deletedAt: null,
    id,
  };
  if (organizationId) queryParameters.organizationId = organizationId;

  const user = await prisma.user.findFirst({
    where: { AND: queryParameters },
  });

  return user;
};

export const getUserByEmail = async ({
  email,
  organizationId,
}: {
  email: string;
  organizationId?: number;
}) => {
  const queryParameters: {
    deletedAt: null;
    email: string;
    organizationId?: number;
  } = {
    deletedAt: null,
    email,
  };
  if (organizationId) queryParameters.organizationId = organizationId;

  const user = await prisma.user.findFirst({
    where: {
      AND: queryParameters,
    },
  });

  return user;
};

export const getUserByUsername = async ({
  username,
  organizationId,
}: {
  username: string;
  organizationId?: number;
}) => {
  const queryParameters: {
    deletedAt: null;
    username: string;
    organizationId?: number;
  } = {
    deletedAt: null,
    username,
  };
  if (organizationId) queryParameters.organizationId = organizationId;

  const user = await prisma.user.findFirst({
    where: {
      AND: queryParameters,
    },
  });

  return user;
};

export const verifyPassword = async ({
  id,
  password,
}: {
  id: number;
  password: string;
}) => {
  const user = await prisma.user.findFirst({
    where: { id },
    select: { password: true },
  });

  if (!user) {
    return false;
  }

  return await bcrypt.compare(password, user.password);
};

// Update

export const updateUser = async (updateBody: {
  id: number;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  phone?: string;
  designation?: string;
}) => {
  const { id, ...data } = updateBody;
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const updateUserEmail = async ({
  id,
  email,
}: {
  id: number;
  email: string;
}) => {
  return await prisma.user.update({
    where: { id },
    data: {
      email,
    },
  });
};

export const updateUserUsername = async ({
  id,
  username,
}: {
  id: number;
  username: string;
}) => {
  return await prisma.user.update({
    where: { id },
    data: {
      username,
    },
  });
};

export const updateUserPassword = async ({
  id,
  password,
}: {
  id: number;
  password: string;
}) => {
  return await prisma.user.update({
    where: { id },
    data: {
      password: bcrypt.hashSync(password, 10),
    },
  });
};

// Delete

export const deleteUser = async ({ id }: { id: number }) => {
  return await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
