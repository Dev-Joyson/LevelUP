import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { 
  companyDashboard, 
  createInternship, 
  getCompanyInternships,
  getApplicationAnalytics,
  updateInternshipCriteria,
  getCompanyProfile,
  updateCompanyProfile,
  getDashboardAnalytics,
  changePassword
} from "../controllers/companyController.js"

const companyRouter = express.Router()

// Dashboard
companyRouter.get('/dashboard', authenticateUser, authorizeRoles("company"), companyDashboard)
companyRouter.get('/dashboard-analytics', authenticateUser, authorizeRoles("company"), getDashboardAnalytics)

// Profile management
companyRouter.get('/profile', authenticateUser, authorizeRoles("company"), getCompanyProfile)
companyRouter.put('/profile', authenticateUser, authorizeRoles("company"), updateCompanyProfile)
companyRouter.put('/change-password', authenticateUser, authorizeRoles("company"), changePassword)

// Internship management
companyRouter.post('/create-internship', authenticateUser, authorizeRoles("company"), createInternship)
companyRouter.get('/internships', authenticateUser, authorizeRoles("company"), getCompanyInternships)
companyRouter.put('/internships/:internshipId/criteria', authenticateUser, authorizeRoles("company"), updateInternshipCriteria)

// Application management
// Note: Application routes moved to applicationRoutes.js

// Analytics
companyRouter.get('/analytics', authenticateUser, authorizeRoles("company"), getApplicationAnalytics)

export default companyRouter;