import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import upload from '../middlewares/multer.js';
import imageUpload from '../middlewares/multerImage.js';
import { 
  studentDashboard, 
  uploadResume, 
  getStudentProfile,
  updateStudentProfile, 
  applyInternship, 
  testScoring,
  getAllInternships,
  getInternshipById,
  bookMentorSession,
  getStudentSessions,
  changePassword,
  uploadProfileImage,
  syncPhoneFromResume,
  // Mock Interview Functions
  getAvailableMockInterviews,
  getMockInterviewDetails,
  getStudentInterviewHistory,
  getInterviewSessionDetails,
  getLatestInterviewSession,
  getStudentInterviewStats,
  downloadInterviewReport,
  getStudentMockInterviewReports
} from '../controllers/studentController.js';

const studentRouter = express.Router()

studentRouter.get("/dashboard", authenticateUser, authorizeRoles("student"), studentDashboard)
studentRouter.post("/resume", authenticateUser, authorizeRoles("student"), upload.single('resume'), uploadResume);
studentRouter.get("/profile", authenticateUser, authorizeRoles("student"), getStudentProfile);
studentRouter.put("/update-profile", authenticateUser, authorizeRoles("student"), updateStudentProfile);
studentRouter.put("/change-password", authenticateUser, authorizeRoles("student"), changePassword);
studentRouter.post("/sync-phone", authenticateUser, authorizeRoles("student"), syncPhoneFromResume);
studentRouter.post("/apply-internship", authenticateUser, authorizeRoles("student"), applyInternship);
studentRouter.get("/test-scoring", authenticateUser, authorizeRoles("student"), testScoring);
studentRouter.post("/book-mentor-session", authenticateUser, authorizeRoles("student"), bookMentorSession);
studentRouter.get("/sessions", authenticateUser, authorizeRoles("student"), getStudentSessions);
studentRouter.get("/internships", getAllInternships);
studentRouter.get("/internships/:id", getInternshipById);
studentRouter.post("/upload-profile-image", authenticateUser, authorizeRoles("student"), imageUpload.single('profileImage'), uploadProfileImage);

// ============= MOCK INTERVIEW ROUTES =============
studentRouter.get("/mock-interviews", authenticateUser, authorizeRoles("student"), getAvailableMockInterviews);
studentRouter.get("/mock-interviews/:interviewId/latest-session", authenticateUser, authorizeRoles("student"), getLatestInterviewSession);
studentRouter.get("/mock-interviews/:interviewId", authenticateUser, authorizeRoles("student"), getMockInterviewDetails);
studentRouter.get("/interview-history", authenticateUser, authorizeRoles("student"), getStudentInterviewHistory);
studentRouter.get("/interview-sessions/:sessionId", authenticateUser, authorizeRoles("student"), getInterviewSessionDetails);
studentRouter.get("/interview-stats", authenticateUser, authorizeRoles("student"), getStudentInterviewStats);
studentRouter.get("/interview-report/:sessionId/download", authenticateUser, authorizeRoles("student"), downloadInterviewReport);
studentRouter.get("/mock-interview-reports", authenticateUser, authorizeRoles("student"), getStudentMockInterviewReports);

// Note: Application routes moved to applicationRoutes.js

export default studentRouter