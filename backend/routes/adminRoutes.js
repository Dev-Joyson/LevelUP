import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { adminDashboard, adminLogin } from "../controllers/adminController.js"

const adminRouter = express.Router()

adminRouter.get('/dashboard', authenticateUser, authorizeRoles("admin"), adminDashboard)
adminRouter.post('/login', adminLogin)

export default adminRouter