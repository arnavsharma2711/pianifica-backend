import { controllerWrapper } from "../lib/controllerWrapper";
// import jwt, { type JwtPayload } from "jsonwebtoken";
// import config from "config";
// import { CustomError } from "../lib/error/custom.error";
// import { getExistingUser } from "../services/user-service";

export const authenticationMiddleware = controllerWrapper(
  async (req, _res, next) => {
    // const { accessToken } = req.cookies || {};
    // const authorization = req.header("Authorization") || "";
    // const access_token = accessToken || authorization.replace("Bearer ", "");

    // if (!access_token) {
    //   throw new CustomError(401, "Invalid Access Token");
    // }

    // const decodedToken = jwt.verify(
    //   access_token,
    //   config.get("internalAccessToken")
    // ) as JwtPayload;
    // const userDetails = await getExistingUser({ id: decodedToken?.id });

    // if (!userDetails) {
    //   throw new CustomError(401, "Invalid Access Token");
    // }

    // req.user = {
    //   id: userDetails.id,
    //   email: userDetails.email,
    //   username: userDetails.username,
    //   organizationId: userDetails.organizationId,
    // };

    req.user = {
      id: 1,
      email: "tony@email.com",
      username: "tony_stark",
      organizationId: 1,
    };

    next();
  }
);
