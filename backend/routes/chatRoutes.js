import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { 
  getChatHistory, 
  markAllMessagesRead, 
  getSessionInfo 
} from "../controllers/chatController.js";

const chatRouter = express.Router();

// Protected routes - require authentication (both mentor and student can access)
chatRouter.get("/session/:sessionId/history", authenticateUser, authorizeRoles("student", "mentor"), getChatHistory);
chatRouter.post("/session/:sessionId/mark-read", authenticateUser, authorizeRoles("student", "mentor"), markAllMessagesRead);
chatRouter.get("/session/:sessionId/info", authenticateUser, authorizeRoles("student", "mentor"), getSessionInfo);

export default chatRouter;
