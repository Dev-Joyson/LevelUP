import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { studentDashboard } from "../controllers/studentController.js"
import upload from '../middlewares/multer.js';
import { uploadResume, getStudentProfile, applyInternship } from '../controllers/studentController.js';

const studentRouter = express.Router()

studentRouter.get("/dashboard", authenticateUser, authorizeRoles("student"), studentDashboard)
studentRouter.post("/resume", authenticateUser, authorizeRoles("student"), upload.single('resume'), uploadResume);
studentRouter.get("/profile", authenticateUser, authorizeRoles("student"), getStudentProfile);
studentRouter.post("/apply-internship", authenticateUser, authorizeRoles("student"), applyInternship);

export default studentRouter