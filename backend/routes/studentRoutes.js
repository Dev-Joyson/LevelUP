import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { studentDashboard } from "../controllers/studentController.js"

const studentRouter = express.Router()

studentRouter.get("/dashboard", authenticateUser, authorizeRoles("student"), studentDashboard)

export default studentRouter