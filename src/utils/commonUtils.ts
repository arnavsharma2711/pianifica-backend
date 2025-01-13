import config from "config";
import jwt from "jsonwebtoken";

export const generateToken = async (
  payload: object,
  expiresIn = "1h",
  secret = config.get<string>("jwtSecret")
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};
