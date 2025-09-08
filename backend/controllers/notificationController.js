import notificationModel from '../models/notificationModel.js';

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    const notification = await notificationModel.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get all notifications for a specific recipient
export const getNotifications = async (req, res) => {
  try {
    const { recipient } = req.params;
    const { isRead, limit = 20, page = 1 } = req.query;
    
    // Build query
    const query = { recipient };
    
    // Add optional filters
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    // Exclude archived notifications by default
    query.isArchived = false;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    // Get notifications with pagination
    const notifications = await notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // Get unread count
    const unreadCount = await notificationModel.countDocuments({
      recipient,
      isRead: false,
      isArchived: false
    });
    
    // Get total count for pagination
    const totalCount = await notificationModel.countDocuments(query);
    
    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// Mark all notifications as read for a recipient
export const markAllAsRead = async (req, res) => {
  try {
    const { recipient } = req.params;
    
    const result = await notificationModel.updateMany(
      { recipient, isRead: false, isArchived: false },
      { isRead: true }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};

// Archive notification
export const archiveNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await notificationModel.findByIdAndUpdate(
      notificationId,
      { isArchived: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ 
      message: 'Notification archived',
      notification 
    });
  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({ message: 'Failed to archive notification', error: error.message });
  }
};

// Get notification count
export const getNotificationCount = async (req, res) => {
  try {
    const { recipient } = req.params;
    
    const unreadCount = await notificationModel.countDocuments({
      recipient,
      isRead: false,
      isArchived: false
    });
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ message: 'Failed to fetch notification count', error: error.message });
  }
};
