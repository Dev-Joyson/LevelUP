import studentModel from '../models/studentModel.js';
import userModel from '../models/userModel.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import cloudinary from '../config/cloudinary.js';
import internshipModel from '../models/internshipModel.js';
import companyModel from '../models/companyModel.js';
import applicationModel from '../models/applicationModel.js';
import { calculateMatchScore } from './scoringController.js';
import { parseResumeData } from './resumeParserController.js';
import resumeModel from '../models/resumeModel.js';
import sessionModel from '../models/sessionModel.js';
import mentorModel from '../models/mentorModel.js';
import bcrypt from 'bcryptjs';

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
    const student = await studentModel.findOne({ userId: req.user.userId }).select('-_id -__v -resumePublicId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
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
    
    const { firstname, lastname, phone, university, graduationYear } = req.body;
    
    // Update fields if provided
    if (firstname) student.firstname = firstname;
    if (lastname) student.lastname = lastname;
    if (phone) student.phone = phone;
    if (university) student.university = university;
    if (graduationYear) student.graduationYear = graduationYear;
    
    await student.save();
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        phone: student.phone,
        university: student.university,
        graduationYear: student.graduationYear
      } 
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
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
  changePassword
}