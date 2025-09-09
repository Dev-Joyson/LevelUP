import studentModel from '../models/studentModel.js';
import mentorModel from '../models/mentorModel.js';
import companyModel from '../models/companyModel.js';
import notificationModel from '../models/notificationModel.js';
import { Server } from 'socket.io';
import { emitAdminNotification } from '../socket/socketHandlers.js';

const registerByRole = async (role, userId, extra) => {
  if (role === 'student') {
    return await studentModel.create({
      userId,
      firstname: extra.firstname || '',
      lastname: extra.lastname || '',
      university: extra.university || '',
      graduationYear: extra.graduationYear || '',
      education: extra.education || '',
      skills: extra.skills || [],
      resumeUrl: extra.resumeUrl || '',
      appliedInternships: extra.appliedInternships || [],
      mockInterviewsTaken: extra.mockInterviewsTaken || [],
      mentorRequests: extra.mentorRequests || [],
    });
  } else if (role === 'mentor') {
    return await mentorModel.create({
      userId,
      firstname: extra.firstname || '',
      lastname: extra.lastname || '',
      expertise: extra.expertise || [],
      availability: extra.availability || [],
      sessions: [],
    });
  } else if (role === 'company') {
    // Create the company
    const company = await companyModel.create({
      userId,
      companyName: extra.companyName,
      description: extra.description,
      website: extra.website || '',
      verified: false,
      internships: [],
      pdfUrl: extra.pdfUrl, // From Cloudinary
      pdfPublicId: extra.pdfPublicId, // From Cloudinary
    });
    
    // Create notification for admin
    try {
      const notification = await notificationModel.create({
        type: 'company_registration',
        title: 'New Company Registration',
        message: `${extra.companyName} has registered and is awaiting verification.`,
        recipient: 'admin',
        entityId: company._id,
        entityModel: 'Company',
        isRead: false,
        isArchived: false
      });
      
      // Get the server instance to emit socket events
      const io = global.io; // Access global io instance
      if (io) {
        // Emit notification to all connected admins
        emitAdminNotification(io, {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          entityId: notification.entityId,
          createdAt: notification.createdAt
        });
      }
      
    } catch (error) {
      console.error('Error creating company registration notification:', error);
    }
    
    return company;
  }
};

export { registerByRole };
