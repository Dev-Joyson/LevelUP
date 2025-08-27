import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { 
  mentorDashboard, 
  getAllPublicMentors, 
  getMentorById,
  scheduleSession,
  getSessionTypes,
  updateSessionTypes,
  addSessionType,
  updateSessionType
} from "../controllers/mentorController.js"


const mentorRouter = express.Router()

// Protected routes - require mentor authentication
mentorRouter.get('/dashboard', authenticateUser, authorizeRoles("mentor"), mentorDashboard)
mentorRouter.get('/session-types', authenticateUser, authorizeRoles("mentor"), getSessionTypes)
mentorRouter.put('/session-types', authenticateUser, authorizeRoles("mentor"), updateSessionTypes)
mentorRouter.post('/session-types', authenticateUser, authorizeRoles("mentor"), addSessionType)
mentorRouter.put('/session-types/:id', authenticateUser, authorizeRoles("mentor"), updateSessionType)

// Student routes - require student authentication
mentorRouter.post('/schedule-session', authenticateUser, authorizeRoles("student"), scheduleSession)

// Public routes - no authentication required
mentorRouter.get('/public', getAllPublicMentors)
mentorRouter.get('/public/:id', getMentorById)

export default mentorRouter