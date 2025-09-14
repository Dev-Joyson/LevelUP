import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { 
  getStudentApplications, 
  getApplicationById,
  getCompanyApplications,
  updateApplicationStatus
} from '../controllers/applicationController.js';

const applicationRouter = express.Router();

// Student routes
applicationRouter.get("/student", authenticateUser, authorizeRoles("student"), getStudentApplications);
applicationRouter.get("/student/:applicationId", authenticateUser, authorizeRoles("student"), getApplicationById);

// Company routes
applicationRouter.get("/company", authenticateUser, authorizeRoles("company"), getCompanyApplications);
applicationRouter.put("/:applicationId/status", authenticateUser, authorizeRoles("company", "admin"), updateApplicationStatus);

export default applicationRouter;
