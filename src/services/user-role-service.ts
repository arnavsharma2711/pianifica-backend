import { CustomError } from "../lib/error/custom.error";
import { getExistingUserByUsername } from "./user-service";
import * as userRoleModel from "../models/user-role-model";

export const promoteUserToAdmin = async ({
  username,
  organizationId,
}: {
  username: string;
  organizationId: number;
}) => {
  const user = await getExistingUserByUsername({ username, organizationId });

  const userRoles = await userRoleModel.getUserRoleByUserId({
    userId: user.id,
  });
  if (userRoles.some((role) => role.role === "ORG_ADMIN")) {
    throw new CustomError(400, "User is already an admin");
  }

  await userRoleModel.createUserRole({
    userId: user.id,
    role: "ORG_ADMIN",
  });

  return "User promoted successfully";
};

export const demoteUserToMember = async ({
  username,
  organizationId,
}: {
  username: string;
  organizationId: number;
}) => {
  const user = await getExistingUserByUsername({ username, organizationId });

  const userRoles = await userRoleModel.getUserRoleByUserId({
    userId: user.id,
  });
  if (!userRoles.some((role) => role.role === "ORG_ADMIN")) {
    throw new CustomError(400, "User is not an admin");
  }

  await userRoleModel.deleteUserRole({
    userId: user.id,
    role: "ORG_ADMIN",
  });

  return "User demoted successfully";
};
