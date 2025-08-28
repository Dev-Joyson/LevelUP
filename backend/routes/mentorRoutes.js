import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { 
  mentorDashboard, 
  getAllPublicMentors, 
  getMentorById,
  getCurrentMentorProfile,
  getMentorAvailability,
  saveMentorAvailability,
  testMentorData,
  scheduleSession,
  getSessionTypes,
  updateSessionTypes,
  addSessionType,
  updateSessionType
} from "../controllers/mentorController.js"


const mentorRouter = express.Router()

// Protected routes - require mentor authentication
mentorRouter.get('/dashboard', authenticateUser, authorizeRoles("mentor"), mentorDashboard)
mentorRouter.get('/me', authenticateUser, authorizeRoles("mentor"), getCurrentMentorProfile)
mentorRouter.get('/session-types', authenticateUser, authorizeRoles("mentor"), getSessionTypes)
mentorRouter.put('/session-types', authenticateUser, authorizeRoles("mentor"), updateSessionTypes)
mentorRouter.post('/session-types', authenticateUser, authorizeRoles("mentor"), addSessionType)
mentorRouter.put('/session-types/:id', authenticateUser, authorizeRoles("mentor"), updateSessionType)
mentorRouter.put('/availability', authenticateUser, authorizeRoles("mentor"), saveMentorAvailability)
mentorRouter.get('/test-data', authenticateUser, authorizeRoles("mentor"), testMentorData)

// Student routes - require student authentication
mentorRouter.post('/schedule-session', authenticateUser, authorizeRoles("student"), scheduleSession)

// Public routes - no authentication required
mentorRouter.get('/public', getAllPublicMentors)
mentorRouter.get('/public/:id', getMentorById)
mentorRouter.get('/public/:id/availability', getMentorAvailability)

export default mentorRouter