import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { companyDashboard } from "../controllers/companyController.js"

const companyRouter = express.Router()

companyRouter.get('/dashboard', authenticateUser, authorizeRoles("company"), companyDashboard)

export default companyRouter;