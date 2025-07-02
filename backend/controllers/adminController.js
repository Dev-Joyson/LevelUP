import jwt from 'jsonwebtoken'
import companyModel from '../models/companyModel.js'
import userModel from '../models/userModel.js'
import mentorModel from '../models/mentorModel.js';
import studentModel from '../models/studentModel.js'
import { sendEmail } from '../utils/emailService.js'

const adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { id: "admin", role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ message: "Admin login successful", token });
};

const adminDashboard = (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
  };

// Get all unverified companies
const getUnverifiedCompanies = async (req, res) => {
  try {
    const companies = await companyModel.find({ verified: false })
      .populate('userId', 'email')
      .select('-__v');
    
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching unverified companies:', error);
    res.status(500).json({ message: 'Error fetching unverified companies' });
  }
};

// API to get All companies 
const getAllCompanies = async (req, res) => {
  try {
    const companies = await companyModel.find({})
      .populate('userId', 'email')
      .select('-__v')
    res.status(200).json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
}

// Get all student users
const getAllStudents = async (req, res) => {
  try {
   const students = await studentModel.find({});

    res.status(200).json({
      message: 'All student accounts fetched successfully',
      students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching student data' });
  }
};

// // Get all students
// const getAllStudents = async (req, res) => {
//   try {
//     const studentModel = (await import('../models/studentModel.js')).default;
//     const students = await studentModel.find({}).populate('userId', 'email').select('-__v');
//     res.status(200).json(students);
//   } catch (error) {
//     console.error('Error fetching students:', error);
//     res.status(500).json({ message: 'Error fetching students' });
//   }
// };

//get all mentors details
// const getAllMentors = async (req, res) => {
//   try {
//    const mentors = await mentorModel.find({});

//     res.status(200).json({
//       message: 'All mentor accounts fetched successfully',
//       mentors,
//     });
//   } catch (error) {
//     console.error('Error fetching students:', error);
//     res.status(500).json({ message: 'Error fetching mentor data' });
//   }
// };




// Verify a company
const verifyCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await companyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update company verification status
    company.verified = true;
    await company.save();

    // Get company email
    const user = await userModel.findById(company.userId);
    if (!user) {
      return res.status(404).json({ message: 'Company user not found' });
    }

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Company Account Verified - LevelUP',
      html: `
        <h1>Congratulations! Your Company Account Has Been Verified</h1>
        <p>Dear ${company.companyName},</p>
        <p>Your company account has been verified and approved. You can now:</p>
        <ul>
          <li>Post internships</li>
          <li>Manage applicants</li>
          <li>Access all company features</li>
        </ul>
        <p>Login to your account to get started!</p>
        <p>Best regards,<br>The LevelUP Team</p>
      `
    });

    res.status(200).json({ 
      message: 'Company verified successfully',
      company: {
        id: company._id,
        companyName: company.companyName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error verifying company:', error);
    res.status(500).json({ message: 'Error verifying company' });
  }
};

// Reject a company
const rejectCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    const company = await companyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get company email
    const user = await userModel.findById(company.userId);
    if (!user) {
      return res.status(404).json({ message: 'Company user not found' });
    }

    // Send rejection email
    await sendEmail({
      to: user.email,
      subject: 'Company Account Verification Update - LevelUP',
      html: `
        <h1>Company Account Verification Update</h1>
        <p>Dear ${company.companyName},</p>
        <p>We regret to inform you that your company account verification has been rejected.</p>
        <p>Reason: ${reason || 'Document verification failed'}</p>
        <p>Please review your registration document and submit a new one if needed.</p>
        <p>Best regards,<br>The LevelUP Team</p>
      `
    });

    // Delete the company profile
    await companyModel.findByIdAndDelete(companyId);

    res.status(200).json({ message: 'Company rejected and notified successfully' });
  } catch (error) {
    console.error('Error rejecting company:', error);
    res.status(500).json({ message: 'Error rejecting company' });
  }
};

// Delete a mentor by ID
const deleteMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await (await import('../models/mentorModel.js')).default.findByIdAndDelete(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.status(200).json({ message: 'Mentor deleted successfully' });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    res.status(500).json({ message: 'Error deleting mentor' });
  }
};

// // Get all mentors
const getAllMentors = async (req, res) => {
  try {
    const mentorModel = (await import('../models/mentorModel.js')).default;
    const mentors = await mentorModel.find({})
      .populate('userId', 'email isVerified')
      .select('-__v');
    res.status(200).json(mentors.map(m => ({
      _id: m._id,
      firstname: m.firstname,
      lastname: m.lastname,
      expertise: m.expertise,
      availability: m.availability,
      sessions: m.sessions,
      userId: m.userId?._id,
      email: m.userId?.email,
      isVerified: m.userId?.isVerified
    })));
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Error fetching mentors' });
  }
};



// Get all unverified mentors
const getUnverifiedMentors = async (req, res) => {
  try {
    const mentorModel = (await import('../models/mentorModel.js')).default;
    const userModel = (await import('../models/userModel.js')).default;
    // Find mentors whose userId points to a user with isVerified: false
    const unverifiedMentors = await mentorModel.find({})
      .populate({
        path: 'userId',
        select: 'email isVerified',
        match: { isVerified: false }
      })
      .select('-__v');
    // Filter out mentors where userId is null (i.e., user is verified)
    const filtered = unverifiedMentors.filter(m => m.userId);
    res.status(200).json(filtered);
  } catch (error) {
    console.error('Error fetching unverified mentors:', error);
    res.status(500).json({ message: 'Error fetching unverified mentors' });
  }
};

// Invite a mentor by sending an email
const inviteMentor = async (req, res) => {
  try {
    const { email, message } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    await sendEmail({
      to: email,
      subject: 'Invitation to Become a Mentor - LevelUP',
      html: `
        <h1>Welcome to LevelUP! 🌟</h1>
        <p>Dear Mentor,</p>
        <p>We hope this message finds you well. We are thrilled to invite you to join the LevelUP community as a mentor. Your experience and passion can make a real difference for our students and aspiring professionals.</p>
        <p>To get started, simply click the link below to complete your mentor registration. Your email will be pre-filled for your convenience:</p>
        <p><a href="https://level-up-five.vercel.app/register?role=mentor&email=${encodeURIComponent(email)}" style="color: #2563eb; text-decoration: underline;">Complete Your Mentor Registration</a></p>
        <p>If you have any questions or need assistance, feel free to reply to this email. We are here to help!</p>
        <p>Thank you for considering this opportunity to inspire and guide others.<br/>Warm regards,<br/>The LevelUP Team</p>
      `
    });
    res.status(200).json({ message: 'Invitation email sent successfully' });
  } catch (error) {
    console.error('Error sending mentor invitation:', error);
    res.status(500).json({ message: 'Error sending mentor invitation' });
  }
};

// Reject a mentor by sending an email and deleting the mentor profile
const rejectMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { reason } = req.body;
    const mentorModel = (await import('../models/mentorModel.js')).default;
    const userModel = (await import('../models/userModel.js')).default;
    const mentor = await mentorModel.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    const user = await userModel.findById(mentor.userId);
    if (!user) {
      return res.status(404).json({ message: 'Mentor user not found' });
    }
    await sendEmail({
      to: user.email,
      subject: 'Mentor Application Update - LevelUP',
      html: `
        <h1>Mentor Application Update</h1>
        <p>Dear Mentor,</p>
        <p>We regret to inform you that your mentor application has been rejected.</p>
        <p>Reason: ${reason || 'Document verification failed'}</p>
        <p>Please review your registration document and submit a new one if needed.</p>
        <p>Best regards,<br/>The LevelUP Team</p>
      `
    });
    await mentorModel.findByIdAndDelete(mentorId);
    res.status(200).json({ message: 'Mentor rejected and notified successfully' });
  } catch (error) {
    console.error('Error rejecting mentor:', error);
    res.status(500).json({ message: 'Error rejecting mentor' });
  }
};

// Verify a mentor by updating user account and sending an email
const verifyMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentorModel = (await import('../models/mentorModel.js')).default;
    const userModel = (await import('../models/userModel.js')).default;
    const mentor = await mentorModel.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    const user = await userModel.findById(mentor.userId);
    if (!user) {
      return res.status(404).json({ message: 'Mentor user not found' });
    }
    user.isVerified = true;
    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'Mentor Account Verified - LevelUP',
      html: `
        <h1>Congratulations! Your Mentor Account Has Been Verified</h1>
        <p>Dear Mentor,</p>
        <p>Your mentor account has been verified and approved. You can now:</p>
        <ul>
          <li>Host mentorship sessions</li>
          <li>Connect with students</li>
          <li>Access all mentor features</li>
        </ul>
        <p>Login to your account to get started!</p>
        <p>Best regards,<br/>The LevelUP Team</p>
      `
    });
    res.status(200).json({ 
      message: 'Mentor verified successfully',
      mentor: {
        id: mentor._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error verifying mentor:', error);
    res.status(500).json({ message: 'Error verifying mentor' });
  }
};

export { 
  adminDashboard, 
  adminLogin, 
  getUnverifiedCompanies, 
  verifyCompany, 
  rejectCompany,
  getAllCompanies,
  deleteMentor,
  getAllMentors,
  getAllStudents,
  getUnverifiedMentors,
  inviteMentor,
  rejectMentor,
  verifyMentor
};