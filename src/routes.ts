import express from "express";
import { healthCheck } from "./controllers/health";

import { authenticationMiddleware } from "./middlewares/authentication";

import * as organizationController from "./controllers/organization-controller";
import * as userController from "./controllers/user-controller";

const router = express.Router();

router.get("/health", healthCheck);

// Organization
router.post("/organization", organizationController.createOrganization);
router.get("/organizations", organizationController.getOrganizations);
router.get("/organization/:id", organizationController.getOrganization);
router.put("/organization/:id", organizationController.updateOrganization);
router.delete("/organization/:id", organizationController.deleteOrganization);

// User
router.post("/user", userController.createUser);
router.get("/users", authenticationMiddleware, userController.getUsers);
router.get(
  "/user/:username",
  authenticationMiddleware,
  userController.getUserByUsername
);
router.put("/user/:id", authenticationMiddleware, userController.updateUser);
router.patch(
  "/user/:id/email",
  authenticationMiddleware,
  userController.updateUserEmail
);
router.patch(
  "/user/:id/username",
  authenticationMiddleware,
  userController.updateUserUsername
);
router.patch(
  "/user/:id/password",
  authenticationMiddleware,
  userController.updateUserPassword
);
router.delete("/user/:id", authenticationMiddleware, userController.deleteUser);

export default router;
