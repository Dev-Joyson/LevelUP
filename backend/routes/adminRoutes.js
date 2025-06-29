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
  getAllStudents
} from "../controllers/adminController.js"


const adminRouter = express.Router()

// Admin authentication
adminRouter.post('/login', adminLogin)
adminRouter.get('/dashboard', authenticateUser, authorizeRoles("admin"), adminDashboard)

// Company verification routes
adminRouter.get('/companies/unverified', authenticateUser, authorizeRoles("admin"), getUnverifiedCompanies)
adminRouter.get('/companies', authenticateUser, authorizeRoles("admin"), getAllCompanies)
adminRouter.post('/companies/:companyId/verify', authenticateUser, authorizeRoles("admin"), verifyCompany)
adminRouter.post('/companies/:companyId/reject', authenticateUser, authorizeRoles("admin"), rejectCompany)
adminRouter.get('/students', authenticateUser, authorizeRoles("admin"), getAllStudents);


// Mentor invitation route
adminRouter.post('/mentors/invite', authenticateUser, authorizeRoles("admin"), inviteMentor)

export default adminRouter