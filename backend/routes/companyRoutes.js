import express from "express"
import { authenticateUser } from "../middlewares/authMiddleware.js"
import { authorizeRoles } from "../middlewares/roleMiddleware.js"
import { companyDashboard, createInternship } from "../controllers/companyController.js"

const companyRouter = express.Router()

companyRouter.get('/dashboard', authenticateUser, authorizeRoles("company"), companyDashboard)
companyRouter.post('/create-internship', authenticateUser, authorizeRoles("company"), createInternship)

export default companyRouter;