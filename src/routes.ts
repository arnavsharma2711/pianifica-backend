import express from "express";
import { healthCheck } from "./controllers/health";

import {
  authenticationMiddleware,
  adminAuthenticationMiddleware,
  superAdminAuthenticationMiddleware,
} from "./middlewares/authentication";

import * as authController from "./controllers/auth-controller";
import * as organizationController from "./controllers/organization-controller";
import * as userController from "./controllers/user-controller";

const router = express.Router();

router.get("/health", healthCheck);

// Auth
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", authenticationMiddleware, authController.getCurrentUser);
router.post("/auth/resetPassword", authController.resetPassword);
router.post(
  "/auth/verifyResetPassword",
  authenticationMiddleware,
  authController.verifyResetPassword,
);
router.post(
  "/auth/generateVerifyEmail",
  authenticationMiddleware,
  authController.generateUserEmail,
);
router.post(
  "/auth/verifyEmail",
  authenticationMiddleware,
  authController.verifyUserEmail,
);

// Organization
router.post("/organization", organizationController.createOrganization);
router.post(
  "/organization/:id/promoteUser",
  authenticationMiddleware,
  adminAuthenticationMiddleware,
  organizationController.promoteUser,
);
router.post(
  "/organization/:id/demoteUser",
  authenticationMiddleware,
  adminAuthenticationMiddleware,
  organizationController.demoteUser,
);
router.get(
  "/organizations",
  authenticationMiddleware,
  superAdminAuthenticationMiddleware,
  organizationController.getOrganizations,
);
router.get(
  "/organization/validate",
  organizationController.checkOrganizationExists,
);
router.get(
  "/organization/:id",
  authenticationMiddleware,
  superAdminAuthenticationMiddleware,
  organizationController.getOrganization,
);
router.put(
  "/organization/:id",
  authenticationMiddleware,
  superAdminAuthenticationMiddleware,
  organizationController.updateOrganization,
);
router.delete(
  "/organization/:id",
  authenticationMiddleware,
  superAdminAuthenticationMiddleware,
  organizationController.deleteOrganization,
);

// User
router.post(
  "/user",
  authenticationMiddleware,
  adminAuthenticationMiddleware,
  userController.createUser,
);
router.get("/users", authenticationMiddleware, userController.getUsers);
router.get("/user/validate", userController.checkUserEmailExists);
router.get(
  "/user/:username",
  authenticationMiddleware,
  userController.getUserByUsername,
);
router.put("/user/:id", authenticationMiddleware, userController.updateUser);
router.patch(
  "/user/:id/email",
  authenticationMiddleware,
  userController.updateUserEmail,
);
router.patch(
  "/user/:id/username",
  authenticationMiddleware,
  userController.updateUserUsername,
);
router.patch(
  "/user/:id/password",
  authenticationMiddleware,
  userController.updateUserPassword,
);
router.delete("/user/:id", authenticationMiddleware, userController.deleteUser);

export default router;
