import express from "express";
import { healthCheck } from "./controllers/health";

import {
  authenticationMiddleware,
  adminAuthenticationMiddleware,
  superAdminAuthenticationMiddleware,
  superUserAuthenticationMiddleware,
} from "./middlewares/authentication";

import * as authController from "./controllers/auth-controller";
import * as organizationController from "./controllers/organization-controller";
import * as userController from "./controllers/user-controller";
import * as teamController from "./controllers/team-controller";
import * as projectController from "./controllers/project-controller";
import * as notificationController from "./controllers/notification-controller";

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
  superUserAuthenticationMiddleware,
  organizationController.getOrganizations,
);
router.get(
  "/organization/validate",
  organizationController.checkOrganizationExists,
);
router.get(
  "/organization/:id",
  authenticationMiddleware,
  superUserAuthenticationMiddleware,
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

// Team
router.post("/team", authenticationMiddleware, teamController.createTeam);
router.get("/teams", authenticationMiddleware, teamController.getTeams);
router.get(
  "/team/validate",
  authenticationMiddleware,
  teamController.checkTeamExists,
);
router.get("/team/:id", authenticationMiddleware, teamController.getTeamById);
router.put("/team/:id", authenticationMiddleware, teamController.updateTeam);
router.delete("/team/:id", authenticationMiddleware, teamController.deleteTeam);
router.get(
  "/team/:id/members",
  authenticationMiddleware,
  teamController.getTeamMembers,
);
router.post(
  "/team/:id/member/:userId",
  authenticationMiddleware,
  teamController.addTeamMember,
);
router.delete(
  "/team/:id/member/:userId",
  authenticationMiddleware,
  teamController.removeTeamMember,
);
router.get(
  "/team/:id/projects",
  authenticationMiddleware,
  teamController.getTeamProjects,
);
router.post(
  "/team/:id/project/:projectId",
  authenticationMiddleware,
  teamController.addTeamProject,
);
router.delete(
  "/team/:id/project/:projectId",
  authenticationMiddleware,
  teamController.removeTeamProject,
);

// Project
router.post("/project", authenticationMiddleware, projectController.createTeam);
router.get(
  "/projects",
  authenticationMiddleware,
  projectController.getProjects,
);
router.get(
  "/project/validate",
  authenticationMiddleware,
  projectController.checkProjectExists,
);
router.get(
  "/project/:id",
  authenticationMiddleware,
  projectController.getProject,
);
router.put(
  "/project/:id",
  authenticationMiddleware,
  projectController.updateProject,
);
router.delete(
  "/project/:id",
  authenticationMiddleware,
  projectController.deleteProject,
);
router.get(
  "/project/:id/teams",
  authenticationMiddleware,
  projectController.getProjectTeams,
);

// Notification
router.get(
  "/notifications",
  authenticationMiddleware,
  notificationController.getAllNotifications,
);
router.patch(
  "/notifications/markAllAsRead",
  authenticationMiddleware,
  notificationController.markAllNotificationsAsRead,
);
router.patch(
  "/notification/:id/markAsRead",
  authenticationMiddleware,
  notificationController.markNotificationAsRead,
);
router.patch(
  "/notification/:id/markAsUnread",
  authenticationMiddleware,
  notificationController.markNotificationAsUnread,
);
router.delete(
  "/notification/:id",
  authenticationMiddleware,
  notificationController.deleteNotification,
);

export default router;
