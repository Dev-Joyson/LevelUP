import studentModel from '../models/studentModel.js';
import userModel from '../models/userModel.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import cloudinary from '../config/cloudinary.js';
import internshipModel from '../models/internshipModel.js';
import companyModel from '../models/companyModel.js';
import applicationModel from '../models/applicationModel.js';
import notificationModel from '../models/notificationModel.js';
import { calculateMatchScore } from './scoringController.js';
import { parseResumeData } from './resumeParserController.js';
import resumeModel from '../models/resumeModel.js';
import sessionModel from '../models/sessionModel.js';
import mentorModel from '../models/mentorModel.js';
import bcrypt from 'bcryptjs';
import { emitAdminNotification, emitMentorNotification } from '../socket/socketHandlers.js';
import mockInterviewModel from '../models/mockInterviewModel.js';
import interviewSessionModel from '../models/interviewSessionModel.js';
import pdfService from '../utils/pdfService.js';
import path from 'path';
import fs from 'fs/promises';

const studentDashboard = (req,res) => {
    res.json({ message: "Welcome to Student Dashboard", user: req.user })
}

// Upload or update student resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    // Remove old resume from Cloudinary if exists
    if (student.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(student.resumePublicId, { resource_type: 'raw' });
      } catch (err) {
        // Log but don't block update
        console.error('Failed to delete old resume from Cloudinary:', err.message);
      }
    }
    // Upload new resume
    const { url, publicId } = await uploadToCloudinary(
      req.file,
      req.user.userId,
      student.firstname + '_' + student.lastname,
     
    );
    student.resumeUrl = url;
    student.resumePublicId = publicId;
    await student.save();

    // Parse resume and save to resumeModel
    let parsedData = {};
    try {
      parsedData = await parseResumeData(req.file.buffer);
    } catch (err) {
      console.error('Resume parsing failed during upload:', err);
      return res.status(500).json({ message: 'Failed to parse resume during upload.' });
    }
    // Remove old resumeModel if exists for this student
    await resumeModel.deleteMany({ studentId: student._id });
    // Save new resumeModel
    await resumeModel.create({
      studentId: student._id,
      resumeUrl: url,
      parsedData,
      uploadedAt: new Date(),
    });

    res.status(200).json({ message: 'Resume uploaded and parsed successfully', resumeUrl: url, parsedData });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Failed to upload resume' });
  }
};

// Apply to an internship with scoring
const applyInternship = async (req, res) => {
  console.log('=== APPLY INTERNSHIP FUNCTION STARTED ===');
  try {
    console.log('1. Finding student...');
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log('Student found:', student._id);

    // Get user email
    console.log('2. Finding user...');
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user.email);

    // Check for resume
    console.log('3. Checking resume...');
    if (!student.resumeUrl) {
      return res.status(400).json({ 
        message: 'Please upload your resume before applying to internships.'
      });
    }
    console.log('Resume URL found:', student.resumeUrl);

    const { internshipId, coverLetter } = req.body;
    console.log('4. Request body:', { internshipId, coverLetter });
    if (!internshipId) {
      return res.status(400).json({ message: 'internshipId is required' });
    }

    console.log('5. Finding internship...');
    const internship = await internshipModel.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    console.log('Internship found:', internship._id);
    console.log('Internship matching criteria:', internship.matchingCriteria);

    // Check if already applied
    console.log('6. Checking existing application...');
    const existingApplication = await applicationModel.findOne({
      studentId: student._id,
      internshipId: internship._id
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied to this internship' 
      });
    }
    console.log('No existing application found');

    // Parse resume and calculate match score
    let resumeData = {};
    let matchScore = { total: 0, breakdown: {}, details: {} };

    console.log('7. Starting resume parsing and scoring...');
    try {
      // Use existing resume parser
      console.log('7a. Fetching resume from URL...');
      const resumeResponse = await fetch(student.resumeUrl);
      const resumeBuffer = await resumeResponse.arrayBuffer();
      
      console.log('7b. Parsing resume data...');
      resumeData = await parseResumeData(Buffer.from(resumeBuffer));
      console.log('Resume parsed successfully:', resumeData);
      
      console.log('7c. About to calculate match score...');
      console.log('Calling calculateMatchScore with:', {
        resumeData: resumeData,
        internship: {
          id: internship._id,
          matchingCriteria: internship.matchingCriteria,
          preferredSkills: internship.preferredSkills
        }
      });
      matchScore = calculateMatchScore(resumeData, internship);
      console.log('Match score calculated:', matchScore);
    } catch (parseError) {
      console.error('Resume parsing failed:', parseError);
      // Continue with application but without scoring
      resumeData = {
        name: `${student.firstname} ${student.lastname}`,
        email: user.email,
        university: student.university
      };
    }

    console.log('8. Creating application...');
    // Create application with scoring
    const application = await applicationModel.create({
      studentId: student._id,
      internshipId: internship._id,
      companyId: internship.companyId,
      student: {
        name: `${student.firstname} ${student.lastname}`,
        email: user.email,
        university: student.university,
        graduationYear: student.graduationYear
      },
      resumeData,
      matchScore,
      coverLetter: coverLetter || '',
      resumeUrl: student.resumeUrl
    });
    console.log('Application created:', application._id);

    console.log('9. Updating internship applicants...');
    // Add student to internship applicants
    if (!internship.applicants.includes(student._id)) {
      internship.applicants.push(student._id);
      await internship.save();
    }

    console.log('10. Updating student applied internships...');
    // Add internship to student's appliedInternships
    if (!student.appliedInternships.includes(internship._id)) {
      student.appliedInternships.push(internship._id);
      await student.save();
    }

    console.log('11. Updating company applied students count...');
    // Increment appliedStudents count for the company
    const company = await companyModel.findById(internship.companyId);
    if (company) {
      company.appliedStudents = (company.appliedStudents || 0) + 1;
      await company.save();
      
      // Create notification for the company
      try {
        const notification = await notificationModel.create({
          type: 'application_submitted',
          title: 'New Application Received',
          message: `${student.firstname} ${student.lastname} has applied for ${internship.title} position.`,
          recipient: 'company',
          entityId: application._id,
          entityModel: 'Application',
          isRead: false,
          isArchived: false
        });
        
        // Emit notification to company via websocket
        const io = global.io;
        if (io) {
          emitCompanyNotification(io, company._id.toString(), {
            _id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            entityId: notification.entityId,
            createdAt: notification.createdAt
          });
        }
      } catch (notifError) {
        console.error('Error creating application notification:', notifError);
        // Don't block the application process if notification fails
      }
    }

    console.log('12. Sending response...');
    res.status(201).json({ 
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        matchScore: matchScore.total,
        breakdown: matchScore.breakdown,
        details: matchScore.details,
        status: application.status
      },
      debug: {
        resumeData: resumeData,
        internshipCriteria: internship.matchingCriteria,
        internshipPreferredSkills: internship.preferredSkills
      }
    });

  } catch (error) {
    console.error('Apply internship error:', error);
    res.status(500).json({ 
      message: 'Failed to apply to internship',
      error: error.message 
    });
  }
};

// Get current student profile
const getStudentProfile = async (req, res) => {
  try {
    // Find the student and populate with user data to get email
    const student = await studentModel.findOne({ userId: req.user.userId })
      .populate('userId', 'email')
      .select('-_id -__v -resumePublicId');
      
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Also get user email from userModel
    const user = await userModel.findById(req.user.userId).select('email');
    
    // Combine student data with user email
    const profileData = {
      ...student.toObject(),
      email: user ? user.email : ''
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Failed to fetch student profile' });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const { firstname, lastname, phoneNumber, email, university, graduationYear } = req.body;
    
    // Update student fields if provided
    if (firstname) student.firstname = firstname;
    if (lastname) student.lastname = lastname;
    if (phoneNumber) student.phoneNumber = phoneNumber; // Fixed field name
    if (university) student.university = university;
    if (graduationYear) student.graduationYear = graduationYear;
    
    // Update email in userModel if provided
    if (email) {
      const user = await userModel.findById(req.user.userId);
      if (user) {
        // Check if email is already taken by another user
        const existingUser = await userModel.findOne({ 
          email: email, 
          _id: { $ne: req.user.userId } 
        });
        
        if (existingUser) {
          return res.status(400).json({ 
            message: 'Email address is already in use by another account' 
          });
        }
        
        user.email = email;
        user.updatedAt = new Date();
        await user.save();
      }
    }
    
    await student.save();
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        phoneNumber: student.phoneNumber, // Fixed field name
        university: student.university,
        graduationYear: student.graduationYear,
        email: email // Return updated email if provided
      } 
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Sync phone number from resume to student profile
const syncPhoneFromResume = async (req, res) => {
  try {
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find the latest resume for this student
    const resumeData = await resumeModel.findOne({ studentId: student._id })
      .sort({ uploadedAt: -1 });
      
    if (!resumeData || !resumeData.parsedData) {
      return res.status(404).json({ message: 'No resume found or resume has no parsed data' });
    }
    
    let phoneFound = false;
    let phoneNumber = '';
    
    // Try various possible formats of phone field
    if (resumeData.parsedData.Phone) {
      phoneNumber = resumeData.parsedData.Phone;
      phoneFound = true;
    } else if (resumeData.parsedData.phone) {
      phoneNumber = resumeData.parsedData.phone;
      phoneFound = true;
    } else if (resumeData.parsedData.PhoneNumber) {
      phoneNumber = resumeData.parsedData.PhoneNumber;
      phoneFound = true;
    } else if (resumeData.parsedData.phoneNumber) {
      phoneNumber = resumeData.parsedData.phoneNumber;
      phoneFound = true;
    } else if (resumeData.parsedData.contact && resumeData.parsedData.contact.phone) {
      phoneNumber = resumeData.parsedData.contact.phone;
      phoneFound = true;
    }
    
    if (!phoneFound) {
      return res.status(404).json({ message: 'No phone number found in resume' });
    }
    
    // Update the student profile with the phone number
    student.phoneNumber = phoneNumber;
    await student.save();
    
    return res.status(200).json({
      message: 'Phone number successfully synced from resume',
      phoneNumber
    });
    
  } catch (error) {
    console.error('Error syncing phone from resume:', error);
    res.status(500).json({ message: 'Failed to sync phone number' });
  }
};

// Get all internship details for students
const getAllInternships = async (req, res) => {
  try {
    const internships = await internshipModel.find({})
      .populate('companyId', 'name logo')
      .select('-__v');
    res.status(200).json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Failed to fetch internships' });
  }
};

// Get single internship details by ID
const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const internship = await internshipModel.findById(id)
      .populate('companyId', 'name logo')
      .select('-__v');
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.status(200).json(internship);
  } catch (error) {
    console.error('Error fetching internship:', error);
    res.status(500).json({ message: 'Failed to fetch internship details' });
  }
};

// Test scoring function
const testScoring = async (req, res) => {
  console.log('=== TEST SCORING FUNCTION ===');
  try {
    const testResumeData = {
      Name: "Test User",
      Email: "test@example.com",
      Skills: {
        "Programming Languages": ["JavaScript", "Python"],
        "Frameworks & Libraries": ["React", "Node.js"]
      },
      Projects: [
        {
          Name: "Test Project",
          Technologies: ["React", "Node.js"]
        }
      ]
    };

    const testInternship = {
      _id: "test123",
      matchingCriteria: {
        skills: 50,
        projects: 20,
        experience: 15,
        gpa: 10,
        certifications: 5
      },
      preferredSkills: ["JavaScript", "React", "Node.js"]
    };

    console.log('Testing with:', { testResumeData, testInternship });
    const result = calculateMatchScore(testResumeData, testInternship);
    console.log('Test result:', result);
    
    res.json({ 
      message: 'Scoring test completed',
      result: result
    });
  } catch (error) {
    console.error('Test scoring error:', error);
    res.status(500).json({ 
      message: 'Test scoring failed',
      error: error.message 
    });
  }
};

// Book a mentor session
const bookMentorSession = async (req, res) => {
  try {
    console.log('=== BOOK MENTOR SESSION FUNCTION STARTED ===');
    
    // Find the student
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log('Student found:', student._id);

    const { mentorId, date, startTime, endTime, sessionTypeId, sessionTypeName, duration, price } = req.body;
    
    // Validate required fields
    if (!mentorId || !date || !startTime || !endTime || !sessionTypeId || !sessionTypeName || !duration || price === undefined) {
      return res.status(400).json({ 
        message: 'All fields are required: mentorId, date, startTime, endTime, sessionTypeId, sessionTypeName, duration, price' 
      });
    }
    
    console.log('Booking request data:', { mentorId, date, startTime, endTime, sessionTypeId, sessionTypeName, duration, price });

    // Find the mentor to verify they exist
    const mentor = await mentorModel.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    console.log('Mentor found:', mentor._id);

    // Verify the session type exists for this mentor
    const sessionType = mentor.sessionTypes.find(type => type._id.toString() === sessionTypeId);
    if (!sessionType) {
      return res.status(400).json({ message: 'Invalid session type for this mentor' });
    }
    console.log('Session type verified:', sessionType.name);

    // Check for conflicting sessions at the same time
    const conflictingSession = await sessionModel.findOne({
      mentorId: mentorId,
      date: new Date(date),
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ],
      status: { $ne: 'cancelled' }
    });

    if (conflictingSession) {
      return res.status(400).json({ 
        message: 'This time slot is already booked. Please select a different time.' 
      });
    }
    console.log('No conflicting sessions found');

    // Create the session
    const newSession = await sessionModel.create({
      studentId: student._id,
      mentorId: mentorId,
      date: new Date(date),
      startTime: startTime,
      endTime: endTime,
      sessionTypeId: sessionTypeId,
      sessionTypeName: sessionTypeName,
      duration: duration,
      price: price,
      status: 'confirmed'
    });
    console.log('Session created:', newSession._id);

    // Add session to student's sessions array
    if (!student.sessions.includes(newSession._id)) {
      student.sessions.push(newSession._id);
      await student.save();
    }
    console.log('Session added to student');

    // Create notification for mentor
    try {
      const mentorNotification = await notificationModel.create({
        type: 'session_booked',
        title: 'New Session Booking',
        message: `${student.firstname || 'A student'} has booked a ${sessionTypeName} session with you for ${new Date(date).toLocaleDateString()} at ${startTime}`,
        recipient: 'mentor',
        entityId: newSession._id,
        entityModel: 'Session'
      });

      console.log('Mentor notification created:', mentorNotification._id);

      // Get the io instance from app locals or import it
      const io = req.app.get('io');
      if (io) {
        // Emit real-time notification to mentor
        emitMentorNotification(io, mentorId, {
          _id: mentorNotification._id,
          type: mentorNotification.type,
          title: mentorNotification.title,
          message: mentorNotification.message,
          createdAt: mentorNotification.createdAt,
          isRead: mentorNotification.isRead
        });
        console.log('Real-time notification sent to mentor');
      }

    } catch (notificationError) {
      console.error('Error creating mentor notification:', notificationError);
      // Don't fail the session booking if notification fails
    }

    // Return success response
    res.status(201).json({
      message: 'Session booked successfully',
      session: {
        sessionId: newSession.sessionId,
        id: newSession._id,
        mentorId: newSession.mentorId,
        date: newSession.date,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        sessionTypeName: newSession.sessionTypeName,
        duration: newSession.duration,
        price: newSession.price,
        status: newSession.status,
        createdAt: newSession.createdAt
      }
    });

  } catch (error) {
    console.error('Book mentor session error:', error);
    res.status(500).json({ 
      message: 'Failed to book session',
      error: error.message 
    });
  }
};

// Get student's booked sessions
const getStudentSessions = async (req, res) => {
  try {
    console.log('=== GET STUDENT SESSIONS FUNCTION STARTED ===');
    
    // Find the student
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log('Student found:', student._id);

    // Fetch all sessions for this student with mentor information
    const sessions = await sessionModel.find({ studentId: student._id })
      .populate({
        path: 'mentorId',
        model: 'mentor',
        select: 'firstname lastname title company profileImage'
      })
      .sort({ date: -1 }); // Sort by date, newest first

    console.log('Found sessions:', sessions.length);

    // Map sessions to match frontend interface and update status based on time
    const formattedSessions = sessions.map(session => {
      const mentor = session.mentorId;
      
      // Get date in YYYY-MM-DD format (local date, no timezone conversion)
      const sessionDate = new Date(session.date);
      const dateOnly = sessionDate.toISOString().split('T')[0]; // Gets YYYY-MM-DD
      
      // Combine date and startTime for status checking only
      const sessionDateTime = new Date(session.date);
      const [hours, minutes] = session.startTime.split(':');
      sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Calculate session end time for status checking
      const sessionEndTime = new Date(sessionDateTime.getTime() + (session.duration * 60000));
      const now = new Date();

      // Determine session status based on time
      let sessionStatus = session.status;
      if (sessionStatus === 'confirmed' && now > sessionEndTime) {
        sessionStatus = 'completed';
        // Update the session in database (fire and forget)
        sessionModel.findByIdAndUpdate(session._id, { status: 'completed' }).catch(err => 
          console.error('Error updating session status:', err)
        );
      }

      return {
        _id: session._id.toString(),
        sessionType: session.sessionTypeName,
        mentorName: mentor ? `${mentor.firstname} ${mentor.lastname}`.trim() : 'Unknown Mentor',
        mentorTitle: mentor ? mentor.title : '',
        mentorImage: mentor ? mentor.profileImage : '',
        date: dateOnly, // ✅ Send date without timezone conversion
        startTime: session.startTime, // ✅ Send time separately  
        duration: session.duration,
        status: sessionStatus,
        notes: '',
        backgroundColor: 'bg-blue-50'
      };
    });

    // Separate sessions by status for better organization
    const upcomingSessions = formattedSessions.filter(session => 
      session.status === 'confirmed'
    );
    const pastSessions = formattedSessions.filter(session => 
      session.status === 'completed' || session.status === 'cancelled'
    );

    console.log('Upcoming sessions:', upcomingSessions.length);
    console.log('Past sessions:', pastSessions.length);

    res.status(200).json({
      message: 'Sessions retrieved successfully',
      sessions: formattedSessions,
      summary: {
        total: formattedSessions.length,
        upcoming: upcomingSessions.length,
        past: pastSessions.length
      }
    });

  } catch (error) {
    console.error('Get student sessions error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch sessions',
      error: error.message 
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Both old password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get user from database
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userModel.findByIdAndUpdate(req.user.userId, { 
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    res.status(200).json({ 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Failed to change password. Please try again.' 
    });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Remove old profile image from Cloudinary
    if (student.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(student.profileImagePublicId, { resource_type: 'image' });
      } catch (err) {
        console.error('Failed to delete old profile image:', err.message);
      }
    }

    const fileName = `${student.firstname}_${student.lastname}_profile`;
    const { url, publicId } = await uploadToCloudinary(req.file, req.user.userId, fileName,   {
      folder: 'student_profile_images',
      resourceType: 'image',
    }
  );

    student.profileImageUrl = url;
    student.profileImagePublicId = publicId;
    await student.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImageUrl: url,
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
};

// ============= MOCK INTERVIEW FUNCTIONS =============

// Get all available mock interviews for students
const getAvailableMockInterviews = async (req, res) => {
  try {
    const { domain, difficulty, search } = req.query;
    
    // Build filter for active and published interviews
    const filter = {
      isActive: true,
      isPublished: true
    };
    
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const mockInterviews = await mockInterviewModel.find(filter)
      .select('-createdBy')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Available mock interviews fetched successfully',
      interviews: mockInterviews.map(interview => ({
        id: interview._id,
        title: interview.title,
        domain: interview.domain,
        difficulty: interview.difficulty,
        numberOfQuestions: interview.numberOfQuestions,
        duration: interview.duration,
        description: interview.description,
        tags: interview.tags,
        totalAttempts: interview.totalAttempts,
        averageScore: interview.averageScore,
        estimatedScore: interview.estimatedScore
      }))
    });
  } catch (error) {
    console.error('Error fetching available mock interviews:', error);
    res.status(500).json({ message: 'Error fetching available mock interviews' });
  }
};

// Get mock interview details by ID
const getMockInterviewDetails = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const mockInterview = await mockInterviewModel.findOne({
      _id: interviewId,
      isActive: true,
      isPublished: true
    });

    if (!mockInterview) {
      return res.status(404).json({ message: 'Mock interview not found or not available' });
    }

    // Check if student has already completed this interview
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const studentId = student._id;
    
    const completedSession = await interviewSessionModel.findOne({
      studentId: studentId,
      mockInterviewId: interviewId,
      status: 'completed'
    });

    // Check if student has an active session for this interview
    const activeSession = await interviewSessionModel.findOne({
      studentId: studentId,
      mockInterviewId: interviewId,
      status: { $in: ['waiting', 'in_progress'] }
    });

    res.status(200).json({
      message: 'Mock interview details fetched successfully',
      interview: {
        id: mockInterview._id,
        title: mockInterview.title,
        domain: mockInterview.domain,
        difficulty: mockInterview.difficulty,
        numberOfQuestions: mockInterview.numberOfQuestions,
        duration: mockInterview.duration,
        description: mockInterview.description,
        tags: mockInterview.tags,
        totalAttempts: mockInterview.totalAttempts,
        averageScore: mockInterview.averageScore,
        estimatedScore: mockInterview.estimatedScore
      },
      studentStatus: {
        hasCompleted: !!completedSession,
        hasActiveSession: !!activeSession,
        activeSessionId: activeSession?.sessionId || null,
        completedScore: completedSession?.finalReport?.overallScore || null,
        completedAt: completedSession?.endedAt || null
      }
    });
  } catch (error) {
    console.error('Error fetching mock interview details:', error);
    res.status(500).json({ message: 'Error fetching mock interview details' });
  }
};

// Get student's interview history
const getStudentInterviewHistory = async (req, res) => {
  try {
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const studentId = student._id;
    const { status, limit = 10, page = 1 } = req.query;

    const filter = { studentId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const sessions = await interviewSessionModel.find(filter)
      .populate('mockInterviewId', 'title domain difficulty numberOfQuestions duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await interviewSessionModel.countDocuments(filter);

    res.status(200).json({
      message: 'Interview history fetched successfully',
      sessions: sessions.map(session => ({
        sessionId: session.sessionId,
        mockInterview: session.mockInterviewId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        currentQuestionNumber: session.currentQuestionNumber,
        totalQuestions: session.totalQuestions,
        questionsAttempted: session.questionsAttempted,
        totalTimeSpent: session.totalTimeSpent,
        finalReport: session.finalReport,
        createdAt: session.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
        hasMore: (page * limit) < total
      }
    });
  } catch (error) {
    console.error('Error fetching student interview history:', error);
    res.status(500).json({ message: 'Error fetching interview history' });
  }
};

// Get specific interview session details
const getInterviewSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const studentId = student._id;

    const session = await interviewSessionModel.findOne({
      sessionId: sessionId,
      studentId: studentId
    }).populate('mockInterviewId', 'title domain difficulty');

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    res.status(200).json({
      message: 'Interview session details fetched successfully',
      session: {
        sessionId: session.sessionId,
        mockInterview: session.mockInterviewId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        currentQuestionNumber: session.currentQuestionNumber,
        totalQuestions: session.totalQuestions,
        questionsAttempted: session.questionsAttempted,
        timeRemaining: session.timeRemaining,
        totalTimeSpent: session.totalTimeSpent,
        answers: session.answers,
        finalReport: session.finalReport,
        connectionLogs: session.connectionLogs
      }
    });
  } catch (error) {
    console.error('Error fetching interview session details:', error);
    res.status(500).json({ message: 'Error fetching session details' });
  }
};

// Get latest session for a specific mock interview
const getLatestInterviewSession = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    // First find the student record using userId from JWT
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const studentId = student._id;

    console.log('🔍 Searching for interview session with:');
    console.log('   interviewId:', interviewId);
    console.log('   studentId:', studentId);
    console.log('   userId from JWT:', req.user.userId);

    // First, let's see what sessions exist for this student
    const allStudentSessions = await interviewSessionModel.find({ studentId: studentId })
      .select('sessionId mockInterviewId status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('📊 Recent sessions for this student:');
    allStudentSessions.forEach(session => {
      console.log(`   Session: ${session.sessionId}, MockInterview: ${session.mockInterviewId}, Status: ${session.status}`);
    });

    // Find the most recent session for this mock interview (prioritize completed sessions)
    const session = await interviewSessionModel.findOne({
      studentId: studentId,
      mockInterviewId: interviewId
    })
    .populate('mockInterviewId', 'title domain difficulty numberOfQuestions duration')
    .sort({ 
      createdAt: -1 // Most recent first
    });

    if (!session) {
      console.log('❌ No session found with the exact criteria');
      return res.status(404).json({ message: 'No interview session found for this mock interview' });
    }

    console.log('✅ Found session:', session.sessionId);

    res.status(200).json({
      message: 'Latest interview session fetched successfully',
      session: {
        sessionId: session.sessionId,
        mockInterview: session.mockInterviewId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        currentQuestionNumber: session.currentQuestionNumber,
        totalQuestions: session.totalQuestions,
        questionsAttempted: session.questionsAttempted,
        timeRemaining: session.timeRemaining,
        totalTimeSpent: session.totalTimeSpent,
        answers: session.answers,
        finalReport: session.finalReport,
        connectionLogs: session.connectionLogs,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching latest interview session:', error);
    res.status(500).json({ message: 'Error fetching latest interview session' });
  }
};

// Get student's interview statistics
const getStudentInterviewStats = async (req, res) => {
  try {
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const studentId = student._id;

    // Total sessions
    const totalSessions = await interviewSessionModel.countDocuments({ studentId });
    const completedSessions = await interviewSessionModel.countDocuments({ 
      studentId, 
      status: 'completed' 
    });
    const terminatedSessions = await interviewSessionModel.countDocuments({ 
      studentId, 
      status: 'terminated' 
    });

    // Average score from completed sessions
    const completedSessionsWithScores = await interviewSessionModel.find({
      studentId,
      status: 'completed',
      'finalReport.overallScore': { $exists: true, $ne: null }
    });

    let averageScore = 0;
    if (completedSessionsWithScores.length > 0) {
      const totalScore = completedSessionsWithScores.reduce(
        (sum, session) => sum + (session.finalReport?.overallScore || 0), 
        0
      );
      averageScore = Math.round((totalScore / completedSessionsWithScores.length) * 100) / 100;
    }

    // Domain performance
    const domainStats = await interviewSessionModel.aggregate([
      { $match: { studentId, status: 'completed' } },
      { $lookup: { from: 'mockinterviews', localField: 'mockInterviewId', foreignField: '_id', as: 'interview' } },
      { $unwind: '$interview' },
      { $group: { 
          _id: '$interview.domain', 
          attempts: { $sum: 1 }, 
          avgScore: { $avg: '$finalReport.overallScore' } 
        } 
      },
      { $sort: { attempts: -1 } }
    ]);

    res.status(200).json({
      message: 'Student interview statistics fetched successfully',
      stats: {
        overview: {
          totalSessions,
          completedSessions,
          terminatedSessions,
          completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
          averageScore
        },
        domainPerformance: domainStats.map(stat => ({
          domain: stat._id,
          attempts: stat.attempts,
          averageScore: Math.round((stat.avgScore || 0) * 100) / 100
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching student interview statistics:', error);
    res.status(500).json({ message: 'Error fetching interview statistics' });
  }
};

// Download interview PDF report from student's mockInterviewReports
const downloadInterviewReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the interview report in student's mockInterviewReports array
    const interviewReport = student.mockInterviewReports.find(
      report => report.sessionId === sessionId
    );

    if (!interviewReport) {
      return res.status(404).json({ message: 'Interview report not found' });
    }

    // Check if PDF exists in Cloudinary
    if (interviewReport.pdfReport?.cloudinaryUrl) {
      console.log(`Redirecting to Cloudinary URL: ${interviewReport.pdfReport.cloudinaryUrl}`);
      
      // Redirect to Cloudinary URL for download
      return res.redirect(interviewReport.pdfReport.cloudinaryUrl);
    }

    // If no PDF exists, generate one (fallback for older reports)
    console.log('No PDF found in student record, generating new one...');

    // Get session data for PDF generation (fallback)
    const session = await interviewSessionModel.findOne({
      sessionId: sessionId,
      studentId: student._id,
      status: 'completed'
    }).populate('mockInterviewId', 'title domain difficulty');

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const studentInfo = {
      name: `${student.firstname} ${student.lastname}`,
      email: req.user.email || 'unknown@email.com'
    };

    const reportData = {
      sessionId: session.sessionId,
      studentId: student._id,
      studentInfo,
      mockInterview: session.mockInterviewId,
      finalReport: session.finalReport,
      answers: session.answers,
      totalTimeSpent: session.totalTimeSpent,
      completedAt: session.endedAt
    };

    const pdfResult = await pdfService.generateInterviewReport(reportData);

    if (pdfResult.success) {
      // Update the student's mockInterviewReports with the new PDF data
      const reportIndex = student.mockInterviewReports.findIndex(
        report => report.sessionId === sessionId
      );
      
      if (reportIndex !== -1) {
        student.mockInterviewReports[reportIndex].pdfReport = {
          cloudinaryUrl: pdfResult.cloudinaryUrl,
          publicId: pdfResult.publicId,
          uploadedAt: pdfResult.uploadedAt
        };
        await student.save();
      }

      // Redirect to new Cloudinary URL
      return res.redirect(pdfResult.cloudinaryUrl);
    } else {
      res.status(500).json({ 
        message: 'Failed to generate PDF report',
        error: pdfResult.error 
      });
    }
  } catch (error) {
    console.error('Error downloading interview report:', error);
    res.status(500).json({ message: 'Error downloading interview report' });
  }
};

// Get student's mock interview reports (stored in student model)
const getStudentMockInterviewReports = async (req, res) => {
  try {
    const student = await studentModel.findOne({ userId: req.user.userId })
      .populate('mockInterviewReports.mockInterviewId', 'title domain difficulty');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Sort reports by completion date (newest first)
    const sortedReports = student.mockInterviewReports
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .map(report => ({
        sessionId: report.sessionId,
        mockInterview: report.mockInterviewId,
        interviewTitle: report.interviewTitle,
        interviewDomain: report.interviewDomain,
        difficulty: report.difficulty,
        completedAt: report.completedAt,
        duration: report.duration,
        summaryReport: report.summaryReport,
        pdfAvailable: !!report.pdfReport?.cloudinaryUrl,
        pdfUrl: report.pdfReport?.cloudinaryUrl || null
      }));

    res.status(200).json({
      message: 'Mock interview reports fetched successfully',
      reports: sortedReports,
      totalReports: sortedReports.length
    });

  } catch (error) {
    console.error('Error fetching student mock interview reports:', error);
    res.status(500).json({ message: 'Error fetching interview reports' });
  }
};

// Bookmark/Save Internship
const bookmarkInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const studentId = req.user.userId;

    // Find student
    const student = await studentModel.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if internship exists
    const internship = await internshipModel.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check if already bookmarked
    if (student.savedInternships.includes(internshipId)) {
      return res.status(400).json({ message: 'Internship already bookmarked' });
    }

    // Add to saved internships
    student.savedInternships.push(internshipId);
    await student.save();

    res.status(200).json({ message: 'Internship bookmarked successfully' });
  } catch (error) {
    console.error('Error bookmarking internship:', error);
    res.status(500).json({ message: 'Failed to bookmark internship' });
  }
};

// Remove bookmark from Internship
const unbookmarkInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const studentId = req.user.userId;

    // Find student
    const student = await studentModel.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove from saved internships
    student.savedInternships = student.savedInternships.filter(
      id => id.toString() !== internshipId
    );
    await student.save();

    res.status(200).json({ message: 'Internship bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Failed to remove bookmark' });
  }
};

// Get saved/bookmarked internships
const getSavedInternships = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Find student and populate saved internships
    const student = await studentModel
      .findOne({ userId: studentId })
      .populate({
        path: 'savedInternships',
        populate: [
          {
            path: 'companyId',
            model: 'company',
            select: 'name logo'
          },
          {
            path: 'company',
            model: 'company', 
            select: 'name logo'
          }
        ]
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student.savedInternships || []);
  } catch (error) {
    console.error('Error getting saved internships:', error);
    res.status(500).json({ message: 'Failed to get saved internships' });
  }
};

// Get Student Dashboard Statistics
const getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.userId;
    console.log('Dashboard Stats - User ID:', studentId);

    // Find student
    const student = await studentModel.findOne({ userId: studentId }).populate('userId');
    if (!student) {
      console.log('Student not found for userId:', studentId);
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log('Student found:', student._id, 'Name:', student.firstname, student.lastname);

    // Get applications count and status breakdown
    const applications = await applicationModel.find({ studentId: student._id });
    console.log('Applications found:', applications.length);
    
    const applicationStats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };

    // Calculate average match score
    const avgMatchScore = applications.length > 0 
      ? applications.reduce((sum, app) => sum + (app.matchScore?.totalScore || 0), 0) / applications.length
      : 0;

    // Get saved internships count
    const savedInternshipsCount = student.savedInternships ? student.savedInternships.length : 0;
    console.log('Saved internships count:', savedInternshipsCount);

    // Get mentor sessions count
    const mentorSessions = await sessionModel.find({ studentId: student._id });
    console.log('Mentor sessions found:', mentorSessions.length);
    
    const sessionStats = {
      total: mentorSessions.length,
      completed: mentorSessions.filter(session => session.status === 'completed').length,
      upcoming: mentorSessions.filter(session => session.status === 'scheduled').length,
      cancelled: mentorSessions.filter(session => session.status === 'cancelled').length
    };

    // Get mock interview stats
    const mockInterviewReports = student.mockInterviewReports || [];
    console.log('Mock interview reports found:', mockInterviewReports.length);
    
    const interviewStats = {
      total: mockInterviewReports.length,
      averageScore: mockInterviewReports.length > 0
        ? mockInterviewReports.reduce((sum, report) => sum + (report.summaryReport?.overallScore || 0), 0) / mockInterviewReports.length
        : 0,
      lastAttempted: mockInterviewReports.length > 0 
        ? mockInterviewReports[mockInterviewReports.length - 1].completedAt
        : null
    };

    // Get recent applications (last 5)
    const recentApplications = await applicationModel
      .find({ studentId: student._id })
      .populate('internshipId', 'title domain')
      .populate('companyId', 'name')
      .sort({ appliedAt: -1 })
      .limit(5);

    // Profile completion percentage
    let profileCompletion = 0;
    const fields = ['firstname', 'lastname', 'education', 'university', 'graduationYear'];
    fields.forEach(field => {
      if (student[field]) profileCompletion += 20;
    });
    if (student.skills && student.skills.length > 0) profileCompletion += 20;
    if (student.resumeUrl) profileCompletion += 20;
    if (student.profileImageUrl) profileCompletion += 10;
    if (student.phoneNumber) profileCompletion += 10;

    // Application success rate
    const successfulApplications = applications.filter(app => 
      app.status === 'accepted' || app.status === 'shortlisted'
    ).length;
    const successRate = applications.length > 0 
      ? (successfulApplications / applications.length) * 100 
      : 0;

    const dashboardData = {
      profile: {
        name: `${student.firstname} ${student.lastname}`,
        email: student.userId.email,
        university: student.university,
        graduationYear: student.graduationYear,
        profileImageUrl: student.profileImageUrl,
        completionPercentage: Math.min(profileCompletion, 100)
      },
      statistics: {
        applications: applicationStats,
        averageMatchScore: Math.round(avgMatchScore * 10) / 10,
        successRate: Math.round(successRate * 10) / 10,
        savedInternships: savedInternshipsCount,
        mentorSessions: sessionStats,
        mockInterviews: interviewStats
      },
      recentActivity: {
        applications: recentApplications.map(app => ({
          id: app._id,
          internshipTitle: app.internshipId?.title || 'Unknown',
          companyName: app.companyId?.name || 'Unknown',
          domain: app.internshipId?.domain || 'General',
          status: app.status,
          appliedAt: app.appliedAt,
          matchScore: app.matchScore?.totalScore || 0
        }))
      }
    };

    console.log('Dashboard data compiled:', {
      profileComplete: dashboardData.profile.completionPercentage,
      totalApps: dashboardData.statistics.applications.total,
      savedInternships: dashboardData.statistics.savedInternships,
      mentorSessions: dashboardData.statistics.mentorSessions.total,
      mockInterviews: dashboardData.statistics.mockInterviews.total
    });

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

// Get Student Application Trends (for charts)
const getStudentApplicationTrends = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Find student first to get the correct studentId
    const student = await studentModel.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get applications from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const applications = await applicationModel.find({
      studentId: student._id,
      appliedAt: { $gte: sixMonthsAgo }
    }).sort({ appliedAt: 1 });

    // Group by month
    const monthlyData = {};
    applications.forEach(app => {
      const month = new Date(app.appliedAt).toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          applications: 0,
          accepted: 0,
          rejected: 0,
          pending: 0,
          totalMatchScore: 0
        };
      }
      monthlyData[month].applications += 1;
      monthlyData[month][app.status] = (monthlyData[month][app.status] || 0) + 1;
      monthlyData[month].totalMatchScore += app.matchScore?.totalScore || 0;
    });

    // Convert to array and calculate averages
    const trendsData = Object.values(monthlyData).map(month => ({
      ...month,
      averageMatchScore: month.applications > 0 
        ? Math.round((month.totalMatchScore / month.applications) * 10) / 10
        : 0
    }));

    res.status(200).json(trendsData);
  } catch (error) {
    console.error('Error fetching application trends:', error);
    res.status(500).json({ message: 'Failed to fetch application trends' });
  }
};

export { 
  studentDashboard, 
  uploadResume, 
  getStudentProfile, 
  updateStudentProfile,
  applyInternship, 
  testScoring, 
  getAllInternships, 
  getInternshipById,
  bookMentorSession, 
  getStudentSessions,
  changePassword,
  uploadProfileImage,
  syncPhoneFromResume,
  // Mock Interview Functions
  getAvailableMockInterviews,
  getMockInterviewDetails,
  getStudentInterviewHistory,
  getInterviewSessionDetails,
  getLatestInterviewSession,
  getStudentInterviewStats,
  downloadInterviewReport,
  getStudentMockInterviewReports,
  bookmarkInternship,
  unbookmarkInternship,
  getSavedInternships,
  getStudentDashboardStats,
  getStudentApplicationTrends
}