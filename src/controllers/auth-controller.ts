import { controllerWrapper } from "../lib/controllerWrapper";
import { userSchema } from "../lib/schema/user.schema";
import { response } from "../middlewares/response";
import {
  generateResetPasswordToken,
  generateVerifyEmailToken,
  validateUserCredentials,
  verifyEmailToken,
  verifyResetPasswordToken,
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
  const { id, organizationId } = req.user;
  const user = await getExistingUserById({ id, organizationId });

  response.success({
    status: 200,
    message: "User logged in successfully",
    data: userSchema.parse(user),
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

// POST api/auth/verifyResetPassword
export const verifyResetPassword = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { newPassword } = req.body;
  if (!newPassword) {
    response.invalid({
      message: "New password is required",
    });
    return;
  }

  const message = await verifyResetPasswordToken({
    userId: req.user.id,
    newPassword,
  });

  response.success({
    status: 200,
    message,
  });
});

// POST api/auth/generateVerifyEmail
export const generateUserEmail = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  await generateVerifyEmailToken({
    email: req.user.email,
  });

  response.success({
    status: 200,
    message: "Verification email sent successfully",
  });
});

// POST api/auth/verifyEmail
export const verifyUserEmail = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const message = await verifyEmailToken({ userId: req.user.id });

  response.success({
    status: 200,
    message,
  });
});
