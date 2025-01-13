import { controllerWrapper } from "../lib/controllerWrapper";
import { response } from "../middlewares/response";
import {
  generateResetPasswordToken,
  validateUserCredentials,
} from "../services/auth-service";
import { getExistingUserById } from "../services/user-service";

// POST api/auth/login
export const login = controllerWrapper(async (req) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    response.invalid({
      message: "Username or password is required",
    });
    return;
  }

  const user = await validateUserCredentials({
    identifier,
    password,
  });

  response.success({
    status: 200,
    message: "User logged in successfully",
    data: user,
  });
});

// POST api/auth/me
export const getCurrentUser = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.user;
  if (!id) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const user = await getExistingUserById({ id });

  response.success({
    status: 200,
    message: "User logged in successfully",
    data: user,
  });
});

// POST api/auth/logout
export const logout = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  response.success({
    status: 200,
    message: "User logged out successfully",
  });
});

// POST api/auth/resetPassword
export const resetPassword = controllerWrapper(async (req) => {
  const { email } = req.body;
  if (!email) {
    response.invalid({
      message: "Email is required",
    });
    return;
  }

  await generateResetPasswordToken({ email });

  response.success({
    status: 200,
    message: "Password reset link sent successfully",
  });
});
