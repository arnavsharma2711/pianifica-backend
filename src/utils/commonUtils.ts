import config from "config";
import jwt from "jsonwebtoken";

export const generateToken = async (
  payload: object,
  expiresIn = "1h",
  secret = config.get<string>("jwtSecret"),
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const isSuperAdmin = (userRoles: string[]) => {
  return userRoles.includes("SUPER_ADMIN");
};

export const isOrgSuperAdmin = (userRoles: string[]) => {
  return userRoles.includes("ORG_SUPER_ADMIN");
};
