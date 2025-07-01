import studentModel from '../models/studentModel.js';
import userModel from '../models/userModel.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import cloudinary from '../config/cloudinary.js';
import internshipModel from '../models/internshipModel.js';
import companyModel from '../models/companyModel.js';
import applicationModel from '../models/applicationModel.js';
import { calculateMatchScore } from './scoringController.js';
import { parseResumeData } from './resumeParserController.js';

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
      'student_resumes'
    );
    student.resumeUrl = url;
    student.resumePublicId = publicId;
    await student.save();
    res.status(200).json({ message: 'Resume uploaded successfully', resumeUrl: url });
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

export { studentDashboard, uploadResume, getStudentProfile, applyInternship, testScoring }