import studentModel from '../models/studentModel.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import cloudinary from '../config/cloudinary.js';
import internshipModel from '../models/internshipModel.js';
import companyModel from '../models/companyModel.js';

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

// Apply to an internship
const applyInternship = async (req, res) => {
  try {
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    // Check for resume and skills
    const missing = [];
    if (!student.resumeUrl) missing.push('resume');
    if (!Array.isArray(student.skills) || student.skills.length === 0) missing.push('skills');
    if (missing.length > 0) {
      return res.status(400).json({ 
        message: `Please ${missing.includes('resume') ? 'upload your resume' : ''}${missing.length === 2 ? ' and ' : ''}${missing.includes('skills') ? 'add at least one skill' : ''} to your profile before applying.`
      });
    }
    const { internshipId } = req.body;
    if (!internshipId) {
      return res.status(400).json({ message: 'internshipId is required' });
    }
    const internship = await internshipModel.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    // Check if already applied
    if (internship.applicants.includes(student._id)) {
      return res.status(400).json({ message: 'You have already applied to this internship' });
    }
    // Add student to applicants
    internship.applicants.push(student._id);
    await internship.save();
    // Add internship to student's appliedInternships
    if (!student.appliedInternships.includes(internship._id)) {
      student.appliedInternships.push(internship._id);
      await student.save();
    }
    // Increment appliedStudents count for the company
    const company = await companyModel.findById(internship.companyId);
    if (company) {
      company.appliedStudents = (company.appliedStudents || 0) + 1;
      await company.save();
    }
    res.status(200).json({ message: 'Applied to internship successfully' });
  } catch (error) {
    console.error('Apply internship error:', error);
    res.status(500).json({ message: 'Failed to apply to internship' });
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

export { studentDashboard, uploadResume, getStudentProfile, applyInternship }