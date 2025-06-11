import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { mentorDashboard } from "../controllers/mentorController.js"

const mentorRouter = express.Router()

mentorRouter.get('/dashboard', authenticateUser, authorizeRoles("mentor"), mentorDashboard)

export default mentorRouter