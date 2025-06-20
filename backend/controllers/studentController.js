import studentModel from '../models/studentModel.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import cloudinary from '../config/cloudinary.js';

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

export { studentDashboard, uploadResume, getStudentProfile }