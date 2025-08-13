import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { 
  companyDashboard, 
  createInternship, 
  getCompanyInternships,
  getCompanyApplications, 
  updateApplicationStatus, 
  getApplicationAnalytics,
  updateInternshipCriteria,
  getCompanyProfile,
  updateCompanyProfile
} from "../controllers/companyController.js"

const companyRouter = express.Router()

// Dashboard
companyRouter.get('/dashboard', authenticateUser, authorizeRoles("company"), companyDashboard)

// Profile management
companyRouter.get('/profile', authenticateUser, authorizeRoles("company"), getCompanyProfile)
companyRouter.put('/profile', authenticateUser, authorizeRoles("company"), updateCompanyProfile)

// Internship management
companyRouter.post('/create-internship', authenticateUser, authorizeRoles("company"), createInternship)
companyRouter.get('/internships', authenticateUser, authorizeRoles("company"), getCompanyInternships)
companyRouter.put('/internships/:internshipId/criteria', authenticateUser, authorizeRoles("company"), updateInternshipCriteria)

// Application management
companyRouter.get('/applications', authenticateUser, authorizeRoles("company"), getCompanyApplications)
companyRouter.put('/applications/:applicationId/status', authenticateUser, authorizeRoles("company"), updateApplicationStatus)

// Analytics
companyRouter.get('/analytics', authenticateUser, authorizeRoles("company"), getApplicationAnalytics)

export default companyRouter;