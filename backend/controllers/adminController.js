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

// Invite a new mentor
const inviteMentor = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Send invitation email
    await sendEmail({
      to: email,
      subject: 'Invitation to Join LevelUP as a Mentor',
      html: `
        <h1>Welcome to LevelUP!</h1>
        <p>Dear ${name},</p>
        <p>You have been invited to join LevelUP as a mentor. We believe your expertise and experience would be invaluable to our platform.</p>
        <p>As a mentor on LevelUP, you'll have the opportunity to:</p>
        <ul>
          <li>Guide and support aspiring students</li>
          <li>Share your industry expertise</li>
          <li>Help shape the next generation of professionals</li>
          <li>Build meaningful connections</li>
        </ul>
        <p>To get started, please click the link below to complete your registration:</p>
        <p><a href="https://level-up-five.vercel.app/register?role=mentor&email=${encodeURIComponent(email)}">Complete Your Mentor Registration</a></p>
        <p>We're excited to have you on board!</p>
        <p>Best regards,<br>The LevelUP Team</p>
      `
    });

    res.status(200).json({ 
      message: 'Mentor invitation sent successfully',
      invitedMentor: { name, email }
    });
  } catch (error) {
    console.error('Error sending mentor invitation:', error);
    res.status(500).json({ message: 'Error sending mentor invitation' });
  }
};

// Approve a mentor (admin only)
const verifyMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await mentorModel.findById(mentorId).populate('userId', 'email');
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    // Set isVerified on the user
    const user = await userModel.findById(mentor.userId._id);
    if (!user) {
      return res.status(404).json({ message: 'Mentor user not found' });
    }
    user.isVerified = true;
    await user.save();

    // Send warm welcome email
    await sendEmail({
      to: mentor.userId.email,
      subject: 'Welcome to LevelUP as a Mentor!',
      html: `
        <h2>Congratulations, ${mentor.userId.email.split('@')[0]}!</h2>
        <p>Your mentor profile has been approved by our admin team.</p>
        <p>We're thrilled to welcome you to the LevelUP community. You can now access your mentor dashboard and start making a difference!</p>
        <ul>
          <li>Connect with students</li>
          <li>Share your expertise</li>
          <li>Help shape future professionals</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Thank you for joining us on this journey!</p>
        <br>
        <p>Warm regards,<br>The LevelUP Team</p>
      `
    });

    res.status(200).json({ 
      message: 'Mentor approved and notified.',
      mentor: {
        id: mentor._id,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error approving mentor:', error);
    res.status(500).json({ message: 'Error approving mentor' });
  }
};

// Reject a mentor
const rejectMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { reason } = req.body;
    const mentor = await mentorModel.findById(mentorId).populate('userId', 'email');
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    // Send rejection email
    await sendEmail({
      to: mentor.userId.email,
      subject: 'Mentor Application Update - LevelUP',
      html: `
        <h2>Mentor Application Update</h2>
        <p>Dear ${mentor.userId.email.split('@')[0]},</p>
        <p>We regret to inform you that your mentor application has been rejected.</p>
        <p>Reason: ${reason || 'Profile did not meet our current requirements.'}</p>
        <p>If you believe this is a mistake or want to improve your application, please contact our support team.</p>
        <br>
        <p>Best regards,<br>The LevelUP Team</p>
      `
    });
    await mentorModel.findByIdAndDelete(mentorId);
    res.status(200).json({ message: 'Mentor rejected and notified successfully' });
  } catch (error) {
    console.error('Error rejecting mentor:', error);
    res.status(500).json({ message: 'Error rejecting mentor' });
  }
};

// Get all mentors
const getAllMentors = async (req, res) => {
  try {
    const mentors = await mentorModel.find({})
      .populate('userId', 'email role isVerified')
      .select('-__v');
    res.status(200).json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Error fetching mentors' });
  }
};

// Get all unverified mentors
const getUnverifiedMentors = async (req, res) => {
  try {
    // Find mentors whose associated user has isVerified: false
    const mentors = await mentorModel.find({})
      .populate({
        path: 'userId',
        select: 'email role isVerified',
        match: { isVerified: false }
      })
      .select('-__v');
    // Filter out mentors where userId is null (i.e., user isVerified !== false)
    const unverifiedMentors = mentors.filter(m => m.userId);
    res.status(200).json(unverifiedMentors);
  } catch (error) {
    console.error('Error fetching unverified mentors:', error);
    res.status(500).json({ message: 'Error fetching unverified mentors' });
  }
};

// Delete a mentor (admin only)
const deleteMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await mentorModel.findById(mentorId).populate('userId', 'email');
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    // Optionally, delete the user as well if you want full cleanup:
    // await userModel.findByIdAndDelete(mentor.userId._id);
    await mentorModel.findByIdAndDelete(mentorId);
    res.status(200).json({ message: 'Mentor deleted successfully' });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    res.status(500).json({ message: 'Error deleting mentor' });
  }
};

export {
  adminDashboard,
  adminLogin,
  getUnverifiedCompanies,
  verifyCompany,
  rejectCompany,
  getAllCompanies,
  inviteMentor,
  verifyMentor,
  getAllMentors,
  getUnverifiedMentors,
  rejectMentor,
  deleteMentor,
};
