import { authenticateSocket, verifySessionAccess } from './socketAuth.js';
import chatModel from '../models/chatModel.js';
import sessionModel from '../models/sessionModel.js';

// Store active users per session
const activeUsers = new Map(); // sessionId -> Set of user objects

export const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userEmail} (${socket.userRole})`);

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
          email: socket.userEmail
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
          role: socket.userRole
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { sessionId } = data;
      if (socket.currentSessionId === sessionId) {
        socket.to(sessionId).emit('user-stopped-typing', {
          userId: socket.userId,
          email: socket.userEmail,
          role: socket.userRole
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
          email: socket.userEmail
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
          email: socket.userEmail
        });
      }
      
      console.log(`User disconnected: ${socket.userEmail}`);
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  console.log('Socket.IO handlers setup complete');
};
