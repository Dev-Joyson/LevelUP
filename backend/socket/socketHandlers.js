import { authenticateSocket, verifySessionAccess } from './socketAuth.js';
import chatModel from '../models/chatModel.js';
import sessionModel from '../models/sessionModel.js';
import notificationModel from '../models/notificationModel.js';

// Store active users per session
const activeUsers = new Map(); // sessionId -> Set of user objects
// Store active admin users for notifications
const activeAdmins = new Set(); // Set of admin socket IDs
// Store active company users for notifications
const activeCompanies = new Map(); // companyId -> Set of socket IDs
// Store active mentor users for notifications
const activeMentors = new Map(); // mentorId -> Set of socket IDs
// Store active student users for notifications
const activeStudents = new Map(); // studentId -> Set of socket IDs

// Function to emit notification to all connected admins
export const emitAdminNotification = (io, notification) => {
  try {
    // Broadcast to all active admin sockets
    if (activeAdmins.size > 0) {
      console.log(`Emitting notification to ${activeAdmins.size} active admins`);
      
      // Convert Set to Array for iteration
      for (const adminSocketId of activeAdmins) {
        io.to(adminSocketId).emit('admin-notification', notification);
      }
    } else {
      console.log('No active admin users to notify');
    }
  } catch (error) {
    console.error('Error emitting admin notification:', error);
  }
};

// Function to emit notification to a specific company
export const emitCompanyNotification = (io, companyId, notification) => {
  try {
    // Check if company has active sockets
    if (activeCompanies.has(companyId) && activeCompanies.get(companyId).size > 0) {
      const companySockets = activeCompanies.get(companyId);
      console.log(`Emitting notification to company ${companyId} with ${companySockets.size} active sockets`);
      
      // Send notification to all active sockets for this company
      for (const socketId of companySockets) {
        io.to(socketId).emit('company-notification', notification);
      }
      return true;
    } else {
      console.log(`No active sockets for company ${companyId}`);
      return false;
    }
  } catch (error) {
    console.error('Error emitting company notification:', error);
    return false;
  }
};


// Function to emit notification to a specific mentor
export const emitMentorNotification = (io, mentorId, notification) => {
  try {
    // Check if mentor has active sockets
    if (activeMentors.has(mentorId) && activeMentors.get(mentorId).size > 0) {
      const mentorSockets = activeMentors.get(mentorId);
      console.log(`Emitting notification to mentor ${mentorId} with ${mentorSockets.size} active sockets`);
      
      // Send notification to all active sockets for this mentor
      for (const socketId of mentorSockets) {
        io.to(socketId).emit('mentor-notification', notification);
      }
      return true;
    } else {
      console.log(`No active sockets for mentor ${mentorId}`);
      return false;
    }
  } catch (error) {
    console.error('Error emitting mentor notification:', error);
    
// Function to emit notification to a specific student
export const emitStudentNotification = (io, studentId, notification) => {
  try {
    // Check if student has active sockets
    if (activeStudents.has(studentId) && activeStudents.get(studentId).size > 0) {
      const studentSockets = activeStudents.get(studentId);
      console.log(`Emitting notification to student ${studentId} with ${studentSockets.size} active sockets`);
      
      // Send notification to all active sockets for this student
      for (const socketId of studentSockets) {
        io.to(socketId).emit('student-notification', notification);
      }
      return true;
    } else {
      console.log(`No active sockets for student ${studentId}`);
      return false;
    }
  } catch (error) {
    console.error('Error emitting student notification:', error);

    return false;
  }
};

export const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userEmail} (${socket.userRole})`);
    
    // If this is an admin user, track them for notifications
    if (socket.userRole === 'admin') {
      activeAdmins.add(socket.id);
      console.log(`Admin user connected: ${socket.userEmail}, total admins online: ${activeAdmins.size}`);
    }
    
    // If this is a company user, track them for notifications
    if (socket.userRole === 'company' && socket.companyId) {
      if (!activeCompanies.has(socket.companyId)) {
        activeCompanies.set(socket.companyId, new Set());
      }
      activeCompanies.get(socket.companyId).add(socket.id);
      console.log(`Company user connected: ${socket.userEmail}, companyId: ${socket.companyId}`);
    }

    // If this is a mentor user, track them for notifications
    if (socket.userRole === 'mentor' && socket.mentorId) {
      if (!activeMentors.has(socket.mentorId)) {
        activeMentors.set(socket.mentorId, new Set());
      }
      activeMentors.get(socket.mentorId).add(socket.id);
      console.log(`Mentor user connected: ${socket.userEmail}, mentorId: ${socket.mentorId}`);
    // If this is a student user, track them for notifications
    if (socket.userRole === 'student' && socket.studentId) {
      if (!activeStudents.has(socket.studentId)) {
        activeStudents.set(socket.studentId, new Set());
      }
      activeStudents.get(socket.studentId).add(socket.id);
      console.log(`Student user connected: ${socket.userEmail}, studentId: ${socket.studentId}`);
    }

    // Handle joining a session chat room
    socket.on('join-session', async (data) => {
      try {
        const { sessionId } = data;
        
        if (!sessionId) {
          socket.emit('error', { message: 'Session ID is required' });
          return;
        }

        // Verify user has access to this session
        const verification = await verifySessionAccess(sessionId, socket.userId, socket.userRole);
        
        if (!verification.hasAccess) {
          socket.emit('access-denied', { 
            message: verification.error,
            sessionTime: verification.sessionTime 
          });
          return;
        }

        // Join the session room
        socket.join(sessionId);
        socket.currentSessionId = sessionId;

        // Add user to active users for this session
        if (!activeUsers.has(sessionId)) {
          activeUsers.set(sessionId, new Set());
        }
        
        const userInfo = {
          userId: socket.userId,
          role: socket.userRole,
          email: socket.userEmail,
          socketId: socket.id
        };
        
        activeUsers.get(sessionId).add(userInfo);

        // Notify user they've joined successfully
        socket.emit('session-joined', { 
          sessionId,
          message: 'Successfully joined session chat',
          sessionInfo: verification.session,
          sessionTime: verification.sessionTime
        });

        // Notify others in the session that user came online
        socket.to(sessionId).emit('user-online', {
          userId: socket.userId,
          role: socket.userRole,
          email: socket.userEmail,
          name: socket.userName
        });

        // Send list of currently online users
        const onlineUsers = Array.from(activeUsers.get(sessionId) || [])
          .filter(user => user.socketId !== socket.id);
        
        socket.emit('online-users', { users: onlineUsers });

        console.log(`User ${socket.userEmail} joined session ${sessionId}`);
      } catch (error) {
        console.error('Join session error:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { sessionId, message } = data;
        
        if (!sessionId || !message || !message.trim()) {
          socket.emit('error', { message: 'Session ID and message are required' });
          return;
        }

        // Verify user is in this session
        if (socket.currentSessionId !== sessionId) {
          socket.emit('error', { message: 'You are not in this session' });
          return;
        }

        // Save message to database
        const chatMessage = await chatModel.create({
          sessionId,
          senderId: socket.userId,
          senderRole: socket.userRole,
          message: message.trim(),
          messageType: 'text'
        });

        // Populate sender info for response
        await chatMessage.populate('senderId', 'email');

        // Format message for clients
        const messageData = {
          _id: chatMessage._id,
          sessionId: chatMessage.sessionId,
          senderId: chatMessage.senderId._id,
          senderEmail: chatMessage.senderId.email,
          senderRole: chatMessage.senderRole,
          message: chatMessage.message,
          messageType: chatMessage.messageType,
          createdAt: chatMessage.createdAt,
          readBy: chatMessage.readBy
        };

        // Send message to all users in the session EXCEPT the sender
        socket.to(sessionId).emit('new-message', messageData);

        console.log(`Message sent in session ${sessionId} by ${socket.userEmail}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { sessionId } = data;
      if (socket.currentSessionId === sessionId) {
        socket.to(sessionId).emit('user-typing', {
          userId: socket.userId,
          email: socket.userEmail,
          role: socket.userRole,
          name: socket.userName
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { sessionId } = data;
      if (socket.currentSessionId === sessionId) {
        socket.to(sessionId).emit('user-stopped-typing', {
          userId: socket.userId,
          email: socket.userEmail,
          role: socket.userRole,
          name: socket.userName
        });
      }
    });

    // Handle message read receipts
    socket.on('mark-message-read', async (data) => {
      try {
        const { messageId, sessionId } = data;
        
        if (!messageId || !sessionId) {
          socket.emit('error', { message: 'Message ID and Session ID are required' });
          return;
        }

        // Find and update the message
        const message = await chatModel.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Mark as read by current user
        await message.markAsRead(socket.userId);

        // Notify all users in session about the read receipt
        io.to(sessionId).emit('message-read', {
          messageId,
          readBy: {
            userId: socket.userId,
            email: socket.userEmail,
            role: socket.userRole,
            readAt: new Date()
          }
        });

      } catch (error) {
        console.error('Mark message read error:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle leaving session
    socket.on('leave-session', () => {
      const sessionId = socket.currentSessionId;
      if (sessionId) {
        socket.leave(sessionId);
        
        // Remove user from active users
        if (activeUsers.has(sessionId)) {
          const users = activeUsers.get(sessionId);
          const userToRemove = Array.from(users).find(user => user.socketId === socket.id);
          if (userToRemove) {
            users.delete(userToRemove);
            
            // Clean up empty session
            if (users.size === 0) {
              activeUsers.delete(sessionId);
            }
          }
        }

        // Notify others that user went offline
        socket.to(sessionId).emit('user-offline', {
          userId: socket.userId,
          role: socket.userRole,
          email: socket.userEmail,
          name: socket.userName
        });

        socket.currentSessionId = null;
        console.log(`User ${socket.userEmail} left session ${sessionId}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const sessionId = socket.currentSessionId;
      if (sessionId) {
        // Remove user from active users
        if (activeUsers.has(sessionId)) {
          const users = activeUsers.get(sessionId);
          const userToRemove = Array.from(users).find(user => user.socketId === socket.id);
          if (userToRemove) {
            users.delete(userToRemove);
            
            // Clean up empty session
            if (users.size === 0) {
              activeUsers.delete(sessionId);
            }
          }
        }

        // Notify others that user went offline
        socket.to(sessionId).emit('user-offline', {
          userId: socket.userId,
          role: socket.userRole,
          email: socket.userEmail,
          name: socket.userName
        });
      }
      
      // If admin, remove from active admins tracking
      if (socket.userRole === 'admin') {
        activeAdmins.delete(socket.id);
        console.log(`Admin user disconnected, remaining admins: ${activeAdmins.size}`);
      }
      
      // If company, remove from active companies tracking
      if (socket.userRole === 'company' && socket.companyId) {
        if (activeCompanies.has(socket.companyId)) {
          activeCompanies.get(socket.companyId).delete(socket.id);
          
          // If no more active connections for this company, remove the entry
          if (activeCompanies.get(socket.companyId).size === 0) {
            activeCompanies.delete(socket.companyId);
          }
          
          console.log(`Company user disconnected: ${socket.userEmail}, companyId: ${socket.companyId}`);
        }
      }


      // If mentor, remove from active mentors tracking
      if (socket.userRole === 'mentor' && socket.mentorId) {
        if (activeMentors.has(socket.mentorId)) {
          activeMentors.get(socket.mentorId).delete(socket.id);
          
          // If no more active connections for this mentor, remove the entry
          if (activeMentors.get(socket.mentorId).size === 0) {
            activeMentors.delete(socket.mentorId);
          }
          
          console.log(`Mentor user disconnected: ${socket.userEmail}, mentorId: ${socket.mentorId}`);
          
      // If student, remove from active students tracking
      if (socket.userRole === 'student' && socket.studentId) {
        if (activeStudents.has(socket.studentId)) {
          activeStudents.get(socket.studentId).delete(socket.id);
          
          // If no more active connections for this student, remove the entry
          if (activeStudents.get(socket.studentId).size === 0) {
            activeStudents.delete(socket.studentId);
          }
          
          console.log(`Student user disconnected: ${socket.userEmail}, studentId: ${socket.studentId}`);
        }
      }
      
      console.log(`User disconnected: ${socket.userEmail}`);
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
    
    // Subscribe to admin notification channel
    socket.on('subscribe-admin-notifications', () => {
      if (socket.userRole === 'admin') {
        console.log(`Admin ${socket.userEmail} subscribed to notifications`);
        socket.join('admin-notifications');
      } else {
        socket.emit('error', { message: 'Only admins can subscribe to admin notifications' });
      }
    });
    
    // Unsubscribe from admin notification channel
    socket.on('unsubscribe-admin-notifications', () => {
      socket.leave('admin-notifications');
      console.log(`User ${socket.userEmail} unsubscribed from admin notifications`);
    });
    
    // Subscribe to company notification channel
    socket.on('subscribe-company-notifications', (data) => {
      const { companyId } = data || {};
      const socketCompanyId = socket.companyId || companyId;
      
      if (socket.userRole === 'company' && socketCompanyId) {
        // Store the company ID with the socket for future reference
        socket.companyId = socketCompanyId;
        
        // Add to active companies tracking if not already there
        if (!activeCompanies.has(socketCompanyId)) {
          activeCompanies.set(socketCompanyId, new Set());
        }
        activeCompanies.get(socketCompanyId).add(socket.id);
        
        // Join the company specific room
        socket.join(`company-${socketCompanyId}`);
        console.log(`Company user ${socket.userEmail} subscribed to notifications for company ${socketCompanyId}`);
      } else {
        socket.emit('error', { message: 'Only company users can subscribe to company notifications' });
      }
    });
    
    // Unsubscribe from company notification channel
    socket.on('unsubscribe-company-notifications', () => {
      if (socket.userRole === 'company' && socket.companyId) {
        socket.leave(`company-${socket.companyId}`);
        console.log(`Company user ${socket.userEmail} unsubscribed from company notifications`);
        
        // Remove from active companies tracking
        if (activeCompanies.has(socket.companyId)) {
          activeCompanies.get(socket.companyId).delete(socket.id);
          
          // Clean up if no more connections
          if (activeCompanies.get(socket.companyId).size === 0) {
            activeCompanies.delete(socket.companyId);
          }
        }
      }
    });


    // Subscribe to mentor notification channel
    socket.on('subscribe-mentor-notifications', (data) => {
      if (socket.userRole === 'mentor' && socket.mentorId) {
        const socketMentorId = socket.mentorId;
        
        // Add to tracking set for real-time notifications
        if (!activeMentors.has(socketMentorId)) {
          activeMentors.set(socketMentorId, new Set());
        }
        activeMentors.get(socketMentorId).add(socket.id);
        
        console.log(`Mentor user ${socket.userEmail} subscribed to notifications for mentor ${socketMentorId}`);
      } else {
        socket.emit('error', { message: 'Only mentor users can subscribe to mentor notifications' });
      }
    });
    
    // Unsubscribe from mentor notification channel
    socket.on('unsubscribe-mentor-notifications', () => {
      if (socket.userRole === 'mentor' && socket.mentorId) {
        console.log(`Mentor user ${socket.userEmail} unsubscribed from mentor notifications`);
        
        // Remove from active mentors tracking
        if (activeMentors.has(socket.mentorId)) {
          activeMentors.get(socket.mentorId).delete(socket.id);
          
          // Clean up if no more connections
          if (activeMentors.get(socket.mentorId).size === 0) {
            activeMentors.delete(socket.mentorId);
          }
        }

    // Subscribe to student notification channel
    socket.on('subscribe-student-notifications', () => {
      if (socket.userRole === 'student' && socket.studentId) {
        console.log(`Student ${socket.userEmail} subscribed to notifications`);
        socket.join(`student-${socket.studentId}`);
      } else {
        socket.emit('error', { message: 'Only students can subscribe to student notifications' });
      }
    });
    
    // Unsubscribe from student notification channel
    socket.on('unsubscribe-student-notifications', () => {
      if (socket.userRole === 'student' && socket.studentId) {
        socket.leave(`student-${socket.studentId}`);
        console.log(`Student user ${socket.userEmail} unsubscribed from student notifications`);

      }
    });
  });

  console.log('Socket.IO handlers setup complete');
};
