import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import upload from '../middlewares/multer.js';
import { 
  studentDashboard, 
  uploadResume, 
  getStudentProfile,
  updateStudentProfile, 
  applyInternship, 
  testScoring,
  getAllInternships,
  getInternshipById,
  getStudentApplications
} from '../controllers/studentController.js';

const studentRouter = express.Router()

studentRouter.get("/dashboard", authenticateUser, authorizeRoles("student"), studentDashboard)
studentRouter.post("/resume", authenticateUser, authorizeRoles("student"), upload.single('resume'), uploadResume);
studentRouter.get("/profile", authenticateUser, authorizeRoles("student"), getStudentProfile);
studentRouter.put("/update-profile", authenticateUser, authorizeRoles("student"), updateStudentProfile);
studentRouter.post("/apply-internship", authenticateUser, authorizeRoles("student"), applyInternship);
studentRouter.get("/test-scoring", authenticateUser, authorizeRoles("student"), testScoring);
studentRouter.get("/internships", getAllInternships);
studentRouter.get("/internships/:id", getInternshipById);
studentRouter.get("/applications", authenticateUser, authorizeRoles("student"), getStudentApplications);

export default studentRouter