import { authenticateSocket, verifySessionAccess } from './socketAuth.js';
import chatModel from '../models/chatModel.js';
import sessionModel from '../models/sessionModel.js';
import notificationModel from '../models/notificationModel.js';
import mockInterviewModel from '../models/mockInterviewModel.js';
import questionModel from '../models/questionModel.js';
import interviewSessionModel from '../models/interviewSessionModel.js';
import interviewChatModel from '../models/interviewChatModel.js';
import openaiService from '../utils/openaiService.js';
import pdfService from '../utils/pdfService.js';
import studentModel from '../models/studentModel.js';

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
    return false;
  }
};

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

// ============= INTERVIEW HELPER FUNCTIONS =============

// Generate PDF report for completed interview and save to student model
const generatePDFReport = async (interviewSession, mockInterview, finalReport) => {
  try {
    // Get student information - we need to populate this
    const populatedSession = await interviewSessionModel.findById(interviewSession._id)
      .populate('studentId', 'firstname lastname email');
    
    const studentInfo = {
      name: populatedSession.studentId 
        ? `${populatedSession.studentId.firstname} ${populatedSession.studentId.lastname}` 
        : 'Student',
      email: populatedSession.studentId?.email || 'unknown@email.com'
    };

    const reportData = {
      sessionId: interviewSession.sessionId,
      studentId: populatedSession.studentId._id, // Add studentId for Cloudinary upload
      studentInfo,
      mockInterview: {
        title: mockInterview.title,
        domain: mockInterview.domain,
        difficulty: mockInterview.difficulty
      },
      finalReport,
      answers: interviewSession.answers || [],
      totalTimeSpent: interviewSession.totalTimeSpent,
      completedAt: interviewSession.endedAt || new Date()
    };

    const pdfResult = await pdfService.generateInterviewReport(reportData);

    if (pdfResult.success) {
      // Update session with PDF path (keep for backward compatibility)
      interviewSession.finalReport.pdfPath = pdfResult.cloudinaryUrl;
      await interviewSession.save();

      // Save interview report to student model
      const student = await studentModel.findById(populatedSession.studentId._id);
      if (student) {
        const interviewReport = {
          sessionId: interviewSession.sessionId,
          mockInterviewId: mockInterview._id,
          interviewTitle: mockInterview.title,
          interviewDomain: mockInterview.domain,
          difficulty: mockInterview.difficulty,
          completedAt: interviewSession.endedAt || new Date(),
          duration: Math.round(interviewSession.totalTimeSpent / 60), // Convert to minutes
          summaryReport: {
            overallScore: finalReport.overallScore,
            categoryScores: finalReport.categoryScores,
            strengths: finalReport.strengths,
            weaknesses: finalReport.weaknesses,
            improvementSuggestions: finalReport.improvementSuggestions,
            summary: finalReport.summary,
            recommendation: finalReport.recommendation,
            questionsAttempted: interviewSession.questionsAttempted,
            totalQuestions: interviewSession.totalQuestions,
            totalTimeSpent: interviewSession.totalTimeSpent
          },
          pdfReport: {
            cloudinaryUrl: pdfResult.cloudinaryUrl,
            publicId: pdfResult.publicId,
            uploadedAt: pdfResult.uploadedAt
          }
        };

        student.mockInterviewReports.push(interviewReport);
        await student.save();

        console.log(`PDF report generated and saved to student model for session ${interviewSession.sessionId}`);
        console.log(`Cloudinary URL: ${pdfResult.cloudinaryUrl}`);
      }
    }
  } catch (error) {
    console.error('Error generating PDF report:', error);
  }
};

// Handle interview completion and generate summary
const handleInterviewCompletion = async (socket, interviewSession) => {
  try {
    // Complete the interview session
    await interviewSession.completeInterview();

    // Get mock interview details
    const mockInterview = await mockInterviewModel.findById(interviewSession.mockInterviewId);
    
    // Prepare session data for summary generation
    const sessionData = {
      mockInterview: {
        domain: mockInterview.domain,
        difficulty: mockInterview.difficulty,
        numberOfQuestions: mockInterview.numberOfQuestions
      },
      answers: interviewSession.answers,
      totalTimeSpent: interviewSession.totalTimeSpent,
      questionsAttempted: interviewSession.questionsAttempted
    };

    // Generate AI summary
    const summaryResult = await openaiService.generateInterviewSummary(sessionData);
    
    if (summaryResult.success) {
      // Save final report to session
      interviewSession.finalReport = summaryResult.summary;
      await interviewSession.save();

      // Create summary message in chat (simple, no score details)
      const summaryMessage = await interviewChatModel.create({
        sessionId: interviewSession.sessionId,
        messageType: 'ai_summary',
        content: `Thank you for completing this mock interview! Your detailed report is being generated and will be available for download shortly.`,
        metadata: {
          eventType: 'interview_completed',
          finalReport: summaryResult.summary
        }
      });

      // Send completion event
      socket.emit('interview-completed', {
        sessionId: interviewSession.sessionId,
        finalReport: summaryResult.summary,
        questionsCompleted: interviewSession.questionsAttempted,
        totalQuestions: interviewSession.totalQuestions,
        timeSpent: Math.round(interviewSession.totalTimeSpent / 60), // Convert to minutes
        summaryMessage: summaryMessage
      });

      // Update mock interview statistics
      await updateMockInterviewStats(mockInterview._id, summaryResult.summary.overallScore);

      // Generate PDF report asynchronously (don't wait for it)
      generatePDFReport(interviewSession, mockInterview, summaryResult.summary)
        .catch(error => console.error('PDF generation error:', error));

      console.log(`Interview ${interviewSession.sessionId} completed with score ${summaryResult.summary.overallScore}`);
    } else {
      // Fallback if summary generation fails
      socket.emit('interview-completed', {
        sessionId: interviewSession.sessionId,
        finalReport: {
          overallScore: 0,
          summary: 'Interview completed but summary generation failed. Please contact support.'
        },
        questionsCompleted: interviewSession.questionsAttempted,
        totalQuestions: interviewSession.totalQuestions,
        error: 'Summary generation failed'
      });
    }

  } catch (error) {
    console.error('Interview completion error:', error);
    socket.emit('interview-error', { 
      message: 'Error completing interview',
      details: error.message 
    });
  }
};

// Update mock interview statistics
const updateMockInterviewStats = async (mockInterviewId, score) => {
  try {
    const mockInterview = await mockInterviewModel.findById(mockInterviewId);
    if (mockInterview) {
      const totalAttempts = mockInterview.totalAttempts + 1;
      const newAverage = ((mockInterview.averageScore * mockInterview.totalAttempts) + score) / totalAttempts;
      
      mockInterview.totalAttempts = totalAttempts;
      mockInterview.averageScore = Math.round(newAverage * 100) / 100; // Round to 2 decimal places
      await mockInterview.save();
    }
  } catch (error) {
    console.error('Error updating mock interview stats:', error);
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
    }
    
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
      // Clean up admin tracking
      if (socket.userRole === 'admin') {
        activeAdmins.delete(socket.id);
        console.log(`Admin user disconnected: ${socket.userEmail}, total admins online: ${activeAdmins.size}`);
      }

      // Clean up company tracking
      if (socket.userRole === 'company' && socket.companyId) {
        if (activeCompanies.has(socket.companyId)) {
          activeCompanies.get(socket.companyId).delete(socket.id);
          if (activeCompanies.get(socket.companyId).size === 0) {
            activeCompanies.delete(socket.companyId);
          }
        }
        console.log(`Company user disconnected: ${socket.userEmail}`);
      }

      // Clean up mentor tracking
      if (socket.userRole === 'mentor' && socket.mentorId) {
        if (activeMentors.has(socket.mentorId)) {
          activeMentors.get(socket.mentorId).delete(socket.id);
          if (activeMentors.get(socket.mentorId).size === 0) {
            activeMentors.delete(socket.mentorId);
          }
        }
        console.log(`Mentor user disconnected: ${socket.userEmail}`);
      }

      // Clean up student tracking
      if (socket.userRole === 'student' && socket.studentId) {
        if (activeStudents.has(socket.studentId)) {
          activeStudents.get(socket.studentId).delete(socket.id);
          if (activeStudents.get(socket.studentId).size === 0) {
            activeStudents.delete(socket.studentId);
          }
        }
        console.log(`Student user disconnected: ${socket.userEmail}`);
      }
      
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

      // Handle interview session cleanup
      const interviewSessionId = socket.currentInterviewSession;
      if (interviewSessionId) {
        // Log disconnection in interview session
        interviewChatModel.create({
          sessionId: interviewSessionId,
          messageType: 'system_message',
          content: `Student disconnected during interview`,
          metadata: {
            eventType: 'student_disconnected',
            disconnectTime: new Date()
          }
        }).catch(err => console.error('Error logging interview disconnect:', err));

        // Leave interview room
        socket.leave(`interview_${interviewSessionId}`);
        
        console.log(`Student ${socket.userEmail} disconnected from interview ${interviewSessionId}`);
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
        }
      }
          
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

    // ============= MOCK INTERVIEW SOCKET HANDLERS =============

    // Start a mock interview session
    socket.on('start-interview', async (data) => {
      try {
        const { mockInterviewId } = data;
        
        if (!mockInterviewId) {
          socket.emit('interview-error', { message: 'Mock interview ID is required' });
          return;
        }

        // Verify user is student
        if (socket.userRole !== 'student') {
          socket.emit('interview-error', { message: 'Only students can start interviews' });
          return;
        }

        // Get mock interview details
        const mockInterview = await mockInterviewModel.findById(mockInterviewId);
        if (!mockInterview || !mockInterview.canStartInterview()) {
          socket.emit('interview-error', { message: 'Interview not available' });
          return;
        }

        // Check if student already has an active session for this interview
        const existingSession = await interviewSessionModel.findOne({
          studentId: socket.studentId,
          mockInterviewId: mockInterviewId,
          status: { $in: ['waiting', 'in_progress'] }
        });

        if (existingSession) {
          console.log(`Resuming existing interview session ${existingSession.sessionId} for student ${socket.studentId}`);
          
          // Check if session has been idle for too long (15 minutes)
          const idleTime = Date.now() - (existingSession.lastActivity || existingSession.startedAt);
          const maxIdleTime = 15 * 60 * 1000; // 15 minutes
          
          if (idleTime > maxIdleTime) {
            console.log(`Session ${existingSession.sessionId} has been idle too long, terminating...`);
            existingSession.status = 'terminated';
            existingSession.endedAt = new Date();
            existingSession.totalTimeSpent = Math.floor((existingSession.endedAt - existingSession.startedAt) / 1000);
            await existingSession.save();
            
            // Create a system message about termination
            await interviewChatModel.create({
              sessionId: existingSession.sessionId,
              messageType: 'system_message',
              content: 'Interview session was automatically terminated due to inactivity.',
              metadata: {
                eventType: 'session_timeout',
                idleTime: Math.floor(idleTime / 1000)
              }
            });
            
            // Don't resume, allow creation of new session
          } else {
            // Update last activity timestamp
            existingSession.lastActivity = new Date();
            await existingSession.save();
            
            // Join the existing interview room
            const roomName = `interview_${existingSession.sessionId}`;
            socket.join(roomName);
            socket.currentInterviewSession = existingSession.sessionId;

            // Get existing messages for this session
            const existingMessages = await interviewChatModel.find({
              sessionId: existingSession.sessionId
            }).sort({ createdAt: 1 });

            // Send existing session data
            socket.emit('interview-started', {
              sessionId: existingSession.sessionId,
              mockInterview: {
                title: mockInterview.title,
                domain: mockInterview.domain,
                difficulty: mockInterview.difficulty,
                duration: mockInterview.duration
              },
              totalQuestions: existingSession.totalQuestions,
              currentQuestion: existingSession.questionsAttempted + 1,
              timeRemaining: existingSession.timeRemaining,
              messages: existingMessages
            });

            return;
          }
        }

        // Get approved questions for this interview
        const questions = await questionModel.find({
          mockInterviewId: mockInterviewId,
          isApproved: true
        }).sort({ questionNumber: 1 });

        if (questions.length === 0) {
          socket.emit('interview-error', { message: 'No questions available for this interview' });
          return;
        }

        // Create new interview session
        const interviewSession = await interviewSessionModel.create({
          studentId: socket.studentId,
          mockInterviewId: mockInterviewId,
          totalQuestions: questions.length,
          timeRemaining: mockInterview.duration * 60 // Convert minutes to seconds
        });

        // Start the interview
        await interviewSession.startInterview();
        
        // Join the interview room
        const roomName = `interview_${interviewSession.sessionId}`;
        socket.join(roomName);
        socket.currentInterviewSession = interviewSession.sessionId;

        // Send welcome message
        const welcomeMessage = await interviewChatModel.create({
          sessionId: interviewSession.sessionId,
          messageType: 'ai_greeting',
          content: `Welcome to your mock interview! I'm Sarah, and I'll be asking you questions today. Let's start with an easy one: Tell me about yourself.`,
          metadata: {
            eventType: 'interview_started'
          }
        });

        // Send first question - use "Tell me about yourself" as a standard first question
        const firstQuestion = questions[0];
        const questionMessage = await interviewChatModel.create({
          sessionId: interviewSession.sessionId,
          messageType: 'ai_question',
          content: firstQuestion.questionText, // Just the question, no prefix
          questionNumber: 1,
          metadata: {
            questionId: firstQuestion._id,
            estimatedTime: firstQuestion.estimatedTime,
            difficulty: firstQuestion.difficulty
          }
        });

        socket.emit('interview-started', {
          sessionId: interviewSession.sessionId,
          mockInterview: {
            title: mockInterview.title,
            domain: mockInterview.domain,
            difficulty: mockInterview.difficulty,
            duration: mockInterview.duration
          },
          totalQuestions: questions.length,
          currentQuestion: 1,
          timeRemaining: interviewSession.timeRemaining,
          messages: [welcomeMessage, questionMessage]
        });

        console.log(`Student ${socket.userEmail} started interview ${interviewSession.sessionId}`);
      } catch (error) {
        console.error('Start interview error:', error);
        socket.emit('interview-error', { message: 'Failed to start interview' });
      }
    });

    // Handle student answers
    socket.on('student-answer', async (data) => {
      try {
        const { sessionId, answer, questionNumber } = data;
        
        if (!sessionId || !answer || !questionNumber) {
          socket.emit('interview-error', { message: 'Session ID, answer, and question number are required' });
          return;
        }

        // Verify this is the student's session
        const interviewSession = await interviewSessionModel.findOne({ 
          sessionId, 
          studentId: socket.studentId,
          status: 'in_progress'
        });

        if (!interviewSession) {
          socket.emit('interview-error', { message: 'Interview session not found or not active' });
          return;
        }

        // Get the current question
        const question = await questionModel.findOne({
          mockInterviewId: interviewSession.mockInterviewId,
          questionNumber: questionNumber,
          isApproved: true
        });

        if (!question) {
          socket.emit('interview-error', { message: 'Question not found' });
          return;
        }

        // Save student answer
        const answerMessage = await interviewChatModel.create({
          sessionId: sessionId,
          messageType: 'student_answer',
          content: answer.trim(),
          questionNumber: questionNumber,
          metadata: {
            questionId: question._id,
            wordCount: answer.trim().split(' ').length,
            typingTime: data.typingTime || 0
          }
        });

        // Show typing indicator for AI evaluation
        socket.emit('ai-typing', { message: 'AI is evaluating your answer...' });

        // Evaluate answer using OpenAI
        const evaluation = await openaiService.evaluateAnswer(
          question.questionText,
          answer,
          question.expectedAnswer,
          question.keyPoints
        );

        if (evaluation.success) {
          // Update last activity timestamp to prevent session timeout
          interviewSession.lastActivity = new Date();
          
          // Save evaluation to session (keep for final report)
          await interviewSession.addAnswer(
            questionNumber,
            question._id,
            answer,
            evaluation.evaluation
          );

          // Send contextually appropriate acknowledgment message
          let contextualResponse;
          const answerLength = answer.trim().split(' ').length;
          const answerLower = answer.toLowerCase();
          
          // Handle very short/generic responses
          if (answerLength <= 3 || answerLower === 'hi' || answerLower === 'hello' || answerLower === 'yes' || answerLower === 'no') {
            contextualResponse = "I'd appreciate a more detailed answer. Could you elaborate on that? But for now, let's move to the next question.";
          }
          // Handle good detailed responses  
          else if (answerLength > 20) {
            const goodResponses = [
              "Great detailed explanation! Let's continue with the next question.",
              "That's a comprehensive answer. Moving on to the next question.",
              "Excellent! Your detailed response shows good understanding. Next question:",
              "Perfect! I can see you've thought this through well. Let's continue."
            ];
            contextualResponse = goodResponses[Math.floor(Math.random() * goodResponses.length)];
          }
          // Handle moderate responses
          else {
            const moderateResponses = [
              "Thank you for that. Let's move to the next question.",
              "I see. Let's continue with the next question.",
              "Alright, moving on to the next question.",
              "Got it. Here's the next question:"
            ];
            contextualResponse = moderateResponses[Math.floor(Math.random() * moderateResponses.length)];
          }
          
          const feedbackMessage = await interviewChatModel.create({
            sessionId: sessionId,
            messageType: 'ai_feedback',
            content: contextualResponse,
            questionNumber: questionNumber,
            metadata: {
              model: evaluation.evaluation.model,
              responseTime: Date.now() - answerMessage.timestamp,
              // Store detailed evaluation for final report but don't send to frontend
              storedEvaluation: evaluation.evaluation
            }
          });

          socket.emit('ai-feedback', {
            questionNumber: questionNumber,
            feedback: contextualResponse,
            message: feedbackMessage
          });

          // Move to next question or end interview
          if (questionNumber < interviewSession.totalQuestions) {
            await interviewSession.nextQuestion();
            
            // Get next question
            const nextQuestion = await questionModel.findOne({
              mockInterviewId: interviewSession.mockInterviewId,
              questionNumber: questionNumber + 1,
              isApproved: true
            });

            if (nextQuestion) {
              const nextQuestionMessage = await interviewChatModel.create({
                sessionId: sessionId,
                messageType: 'ai_question',
                content: nextQuestion.questionText, // Just the question, no "Question X:" prefix
                questionNumber: questionNumber + 1,
                metadata: {
                  questionId: nextQuestion._id,
                  estimatedTime: nextQuestion.estimatedTime,
                  difficulty: nextQuestion.difficulty
                }
              });

              socket.emit('next-question', {
                questionNumber: questionNumber + 1,
                question: nextQuestion.questionText, // Send just the question text
                totalQuestions: interviewSession.totalQuestions
              });
            }
          } else {
            // Interview completed - trigger summary generation
            socket.emit('generating-summary', { message: 'Generating your interview report...' });
            await handleInterviewCompletion(socket, interviewSession);
          }
        } else {
          // AI evaluation failed - send error feedback
          socket.emit('interview-error', { 
            message: 'Failed to evaluate answer. Please try again.' 
          });
        }

      } catch (error) {
        console.error('Student answer error:', error);
        socket.emit('interview-error', { message: 'Error processing answer' });
      }
    });

    // Handle interview termination
    socket.on('terminate-interview', async (data) => {
      try {
        const { sessionId, reason } = data;

        const interviewSession = await interviewSessionModel.findOne({ 
          sessionId, 
          studentId: socket.studentId,
          status: { $in: ['waiting', 'in_progress'] }
        });

        if (interviewSession) {
          interviewSession.status = 'terminated';
          interviewSession.endedAt = new Date();
          interviewSession.totalTimeSpent = Math.floor((interviewSession.endedAt - interviewSession.startedAt) / 1000);
          await interviewSession.save();

          // Log termination
          await interviewChatModel.create({
            sessionId: sessionId,
            messageType: 'system_message',
            content: `Interview terminated: ${reason || 'Student ended session'}`,
            metadata: {
              eventType: 'interview_terminated',
              reason: reason
            }
          });

          socket.emit('interview-terminated', {
            sessionId: sessionId,
            reason: reason,
            questionsCompleted: interviewSession.questionsAttempted,
            totalQuestions: interviewSession.totalQuestions
          });

          // Leave room
          socket.leave(`interview_${sessionId}`);
          socket.currentInterviewSession = null;
        }
      } catch (error) {
        console.error('Terminate interview error:', error);
        socket.emit('interview-error', { message: 'Error terminating interview' });
      }
    });

    // Get interview chat history
    socket.on('get-interview-history', async (data) => {
      try {
        const { sessionId } = data;

        // Verify access
        const interviewSession = await interviewSessionModel.findOne({ 
          sessionId, 
          studentId: socket.studentId 
        });

        if (!interviewSession) {
          socket.emit('interview-error', { message: 'Interview session not found' });
          return;
        }

        const messages = await interviewChatModel.getChatHistory(sessionId);

        socket.emit('interview-history', {
          sessionId: sessionId,
          messages: messages,
          sessionStatus: interviewSession.status
        });
      } catch (error) {
        console.error('Get interview history error:', error);
        socket.emit('interview-error', { message: 'Error fetching interview history' });
      }
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
      }
    });

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
