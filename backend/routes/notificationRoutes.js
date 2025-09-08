import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  archiveNotification, 
  getNotificationCount 
} from '../controllers/notificationController.js';

const notificationRouter = express.Router();

// Get all notifications for a recipient
notificationRouter.get('/:recipient', authenticateUser, getNotifications);

// Get notification count
notificationRouter.get('/count/:recipient', authenticateUser, getNotificationCount);

// Mark notification as read
notificationRouter.put('/:notificationId/read', authenticateUser, markAsRead);

// Mark all notifications as read
notificationRouter.put('/read-all/:recipient', authenticateUser, markAllAsRead);

// Archive notification
notificationRouter.put('/:notificationId/archive', authenticateUser, archiveNotification);

export default notificationRouter;
