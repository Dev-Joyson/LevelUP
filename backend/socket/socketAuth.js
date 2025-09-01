import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// Socket authentication middleware
export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details
    const user = await userModel.findById(decoded.userId).select('-password');
    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user to socket
    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userEmail = user.email;

    console.log(`Socket authenticated: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication failed'));
  }
};

// Verify user has access to session
export const verifySessionAccess = async (sessionId, userId, userRole) => {
  try {
    const sessionModel = (await import('../models/sessionModel.js')).default;
    const studentModel = (await import('../models/studentModel.js')).default;
    const mentorModel = (await import('../models/mentorModel.js')).default;

    // Find the session
    const session = await sessionModel.findById(sessionId);
    if (!session) {
      return { hasAccess: false, error: 'Session not found' };
    }

    // Check if session is active (during session time)
    const now = new Date();
    const sessionDate = new Date(session.date);
    const [hours, minutes] = session.startTime.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const sessionEndTime = new Date(sessionDate.getTime() + (session.duration * 60000));
    
    if (now < sessionDate || now > sessionEndTime) {
      return { 
        hasAccess: false, 
        error: 'Chat is only available during the scheduled session time',
        sessionTime: {
          start: sessionDate,
          end: sessionEndTime,
          current: now
        }
      };
    }

    // Verify user is part of this session
    let hasAccess = false;
    
    if (userRole === 'student') {
      const student = await studentModel.findOne({ userId });
      hasAccess = student && session.studentId.toString() === student._id.toString();
    } else if (userRole === 'mentor') {
      const mentor = await mentorModel.findOne({ userId });
      hasAccess = mentor && session.mentorId.toString() === mentor._id.toString();
    }

    if (!hasAccess) {
      return { hasAccess: false, error: 'Unauthorized access to this session' };
    }

    return { 
      hasAccess: true, 
      session,
      sessionTime: {
        start: sessionDate,
        end: sessionEndTime,
        current: now
      }
    };
  } catch (error) {
    console.error('Session access verification error:', error);
    return { hasAccess: false, error: 'Session verification failed' };
  }
};
