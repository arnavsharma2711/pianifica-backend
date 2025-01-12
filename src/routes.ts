import express from "express";
import { healthCheck } from "./controllers/health";

import * as organizationController from "./controllers/organization-controller";
const router = express.Router();

router.get("/health", healthCheck);

// Organization
router.post("/organization", organizationController.createOrganization);
router.get("/organizations", organizationController.getOrganizations);
router.get("/organization/:id", organizationController.getOrganization);
router.put("/organization/:id", organizationController.updateOrganization);
router.delete("/organization/:id", organizationController.deleteOrganization);

export default router;
