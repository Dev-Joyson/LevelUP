import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { 
  adminDashboard, 
  adminLogin, 
  getUnverifiedCompanies, 
  verifyCompany, 
  rejectCompany, 
  getAllCompanies,
  inviteMentor,
  verifyMentor,
  getAllMentors,
  getUnverifiedMentors,
  rejectMentor,
  deleteMentor,
  getAllStudents,
  getDashboardStats,
  getRegistrationTrends,
  getInternshipAnalytics,
  getRecentActivities,
  getTopCompanies,
  updateCompanyVerification,
  updateMentorVerification,
  migrateMentorVerification,
  updateUserVerification
} from "../controllers/adminController.js"


const adminRouter = express.Router()

// Admin authentication
adminRouter.post('/login', adminLogin)
adminRouter.get('/dashboard', authenticateUser, authorizeRoles("admin"), adminDashboard)

// Dashboard API endpoints
adminRouter.get('/dashboard/stats', authenticateUser, authorizeRoles("admin"), getDashboardStats)
adminRouter.get('/dashboard/trends', authenticateUser, authorizeRoles("admin"), getRegistrationTrends)
adminRouter.get('/dashboard/analytics', authenticateUser, authorizeRoles("admin"), getInternshipAnalytics)
adminRouter.get('/dashboard/activities', authenticateUser, authorizeRoles("admin"), getRecentActivities)
adminRouter.get('/dashboard/top-companies', authenticateUser, authorizeRoles("admin"), getTopCompanies)

// Company verification routes
adminRouter.get('/companies/unverified', authenticateUser, authorizeRoles("admin"), getUnverifiedCompanies)
adminRouter.get('/companies', authenticateUser, authorizeRoles("admin"), getAllCompanies)
adminRouter.post('/companies/:companyId/verify', authenticateUser, authorizeRoles("admin"), verifyCompany)
adminRouter.post('/companies/:companyId/reject', authenticateUser, authorizeRoles("admin"), rejectCompany)
adminRouter.put('/companies/verification', authenticateUser, authorizeRoles("admin"), updateCompanyVerification)

adminRouter.get('/students', authenticateUser, authorizeRoles("admin"), getAllStudents);
adminRouter.get('/mentors', authenticateUser, authorizeRoles("admin"), getAllMentors);

// Mentor invitation and verification routes
adminRouter.post('/mentors/invite', authenticateUser, authorizeRoles("admin"), inviteMentor)
adminRouter.post('/mentors/:mentorId/verify', authenticateUser, authorizeRoles("admin"), verifyMentor)
adminRouter.post('/mentors/:mentorId/reject', authenticateUser, authorizeRoles("admin"), rejectMentor)
adminRouter.delete('/mentors/:mentorId', authenticateUser, authorizeRoles("admin"), deleteMentor)
adminRouter.put('/mentors/verification', authenticateUser, authorizeRoles("admin"), updateMentorVerification)

// Mentor management routes
adminRouter.get('/mentors', authenticateUser, authorizeRoles("admin"), getAllMentors)
adminRouter.get('/mentors/unverified', authenticateUser, authorizeRoles("admin"), getUnverifiedMentors)
adminRouter.post('/mentors/migrate-verification', authenticateUser, authorizeRoles("admin"), migrateMentorVerification)

// User verification routes (for both companies and mentors)
adminRouter.put('/users/verification', authenticateUser, authorizeRoles("admin"), updateUserVerification)

export default adminRouter