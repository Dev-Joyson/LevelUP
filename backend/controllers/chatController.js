import chatModel from '../models/chatModel.js';
import sessionModel from '../models/sessionModel.js';
import studentModel from '../models/studentModel.js';
import mentorModel from '../models/mentorModel.js';
import { verifySessionAccess } from '../socket/socketAuth.js';

// Get chat history for a session
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log(`Getting chat history for session: ${sessionId}`);

    // Verify user has access to this session
    const verification = await verifySessionAccess(sessionId, req.user.userId, req.user.role);
    
    if (!verification.hasAccess) {
      return res.status(403).json({ 
        message: verification.error,
        sessionTime: verification.sessionTime 
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get messages with pagination (most recent first)
    const messages = await chatModel
      .find({ 
        sessionId, 
        isDeleted: false 
      })
      .populate('senderId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Reverse to show oldest first for UI
    const formattedMessages = messages.reverse().map(message => ({
      _id: message._id,
      sessionId: message.sessionId,
      senderId: message.senderId._id,
      senderEmail: message.senderId.email,
      senderRole: message.senderRole,
      message: message.message,
      messageType: message.messageType,
      createdAt: message.createdAt,
      readBy: message.readBy,
      isReadBy: message.readBy.some(read => read.userId.toString() === req.user.userId.toString())
    }));

    // Get total count for pagination
    const totalMessages = await chatModel.countDocuments({ 
      sessionId, 
      isDeleted: false 
    });

    res.status(200).json({
      message: 'Chat history retrieved successfully',
      messages: formattedMessages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / parseInt(limit)),
        totalMessages,
        hasNextPage: skip + messages.length < totalMessages,
        hasPrevPage: page > 1
      },
      sessionInfo: verification.session,
      sessionTime: verification.sessionTime
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve chat history',
      error: error.message 
    });
  }
};

// Mark all messages as read for current user in a session
const markAllMessagesRead = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`Marking all messages as read for session: ${sessionId}`);

    // Verify user has access to this session
    const verification = await verifySessionAccess(sessionId, req.user.userId, req.user.role);
    
    if (!verification.hasAccess) {
      return res.status(403).json({ 
        message: verification.error 
      });
    }

    // Get all unread messages by this user
    const unreadMessages = await chatModel.find({
      sessionId,
      isDeleted: false,
      'readBy.userId': { $ne: req.user.userId }
    });

    // Mark each message as read
    const markPromises = unreadMessages.map(message => 
      message.markAsRead(req.user.userId)
    );
    
    await Promise.all(markPromises);

    res.status(200).json({
      message: 'All messages marked as read',
      markedCount: unreadMessages.length
    });

  } catch (error) {
    console.error('Mark all messages read error:', error);
    res.status(500).json({ 
      message: 'Failed to mark messages as read',
      error: error.message 
    });
  }
};

// Get session info for chat
const getSessionInfo = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`Getting session info: ${sessionId}`);

    // Verify user has access to this session
    const verification = await verifySessionAccess(sessionId, req.user.userId, req.user.role);
    
    if (!verification.hasAccess) {
      return res.status(403).json({ 
        message: verification.error,
        sessionTime: verification.sessionTime 
      });
    }

    // Get detailed session info with participant details
    const session = await sessionModel.findById(sessionId)
      .populate({
        path: 'studentId',
        select: 'firstname lastname',
        populate: {
          path: 'userId',
          select: 'email'
        }
      })
      .populate({
        path: 'mentorId',
        select: 'firstname lastname profileImage',
        populate: {
          path: 'userId',
          select: 'email'
        }
      });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Format session info
    const sessionInfo = {
      _id: session._id,
      sessionId: session.sessionId,
      sessionTypeName: session.sessionTypeName,
      duration: session.duration,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      student: {
        _id: session.studentId._id,
        name: `${session.studentId.firstname} ${session.studentId.lastname}`.trim(),
        email: session.studentId.userId.email
      },
      mentor: {
        _id: session.mentorId._id,
        name: `${session.mentorId.firstname} ${session.mentorId.lastname}`.trim(),
        email: session.mentorId.userId.email,
        profileImage: session.mentorId.profileImage
      }
    };

    res.status(200).json({
      message: 'Session info retrieved successfully',
      session: sessionInfo,
      sessionTime: verification.sessionTime,
      currentUser: {
        userId: req.user.userId,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Get session info error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve session info',
      error: error.message 
    });
  }
};

export { 
  getChatHistory, 
  markAllMessagesRead, 
  getSessionInfo 
};
