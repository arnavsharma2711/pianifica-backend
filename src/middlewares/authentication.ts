import { controllerWrapper } from "../lib/controllerWrapper";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "config";
import { CustomError } from "../lib/error/custom.error";
import { getExistingUserById } from "../services/user-service";
import { getUserRoleByUserId } from "../models/user-role-model";

const ADMIN_ROLES = ["SUPER_ADMIN", "ORG_SUPER_ADMIN", "ORG_ADMIN"];

export const authenticationMiddleware = controllerWrapper(
  async (req, _res, next) => {
    const { accessToken } = req.cookies || {};
    const authorization = req.header("Authorization") || "";
    const access_token = accessToken || authorization.replace("Bearer ", "");

    if (!access_token) {
      throw new CustomError(401, "Invalid Access Token");
    }

    const decodedToken = jwt.verify(
      access_token,
      config.get("jwtSecret"),
    ) as JwtPayload;
    const userDetails = await getExistingUserById({
      id: decodedToken?.id,
    });
    const userRoles = await getUserRoleByUserId({
      userId: userDetails.id,
    });
    if (!userDetails) {
      throw new CustomError(401, "Invalid Access Token");
    }

    req.user = {
      id: userDetails.id,
      email: userDetails.email,
      username: userDetails.username,
      organizationId: userDetails.organizationId,
      userRoles: userRoles.map((role) => role.role),
      isAdmin: userRoles.some((role) => ADMIN_ROLES.includes(role.role)),
    };

    next();
  },
);

export const adminAuthenticationMiddleware = controllerWrapper(
  async (req, _res, next) => {
    if (!req.user?.isAdmin) {
      throw new CustomError(
        401,
        "You are not authorized to perform this action",
      );
    }

    next();
  },
);

export const superAdminAuthenticationMiddleware = controllerWrapper(
  async (req, _res, next) => {
    if (
      !req.user?.userRoles.some(
        (role) => role === "SUPER_ADMIN" || role === "ORG_SUPER_ADMIN",
      )
    ) {
      throw new CustomError(
        401,
        "You are not authorized to perform this action",
      );
    }

    next();
  },
);
