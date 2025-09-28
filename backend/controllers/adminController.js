import jwt from 'jsonwebtoken'
import companyModel from '../models/companyModel.js'
import userModel from '../models/userModel.js'
import mentorModel from '../models/mentorModel.js';
import studentModel from '../models/studentModel.js'
import resumeModel from '../models/resumeModel.js'
import notificationModel from '../models/notificationModel.js'
import internshipModel from '../models/internshipModel.js'
import { sendEmail } from '../utils/emailService.js'
import { emitAdminNotification } from '../socket/socketHandlers.js'
import mockInterviewModel from '../models/mockInterviewModel.js'
import questionModel from '../models/questionModel.js'
import interviewSessionModel from '../models/interviewSessionModel.js'
import openaiService from '../utils/openaiService.js'

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
    const students = await studentModel.find({}).populate('userId', 'email isVerified');
    
    // Get resume data for all students and extract degree information
    const studentsWithMajor = await Promise.all(
      students.map(async (student) => {
        try {
          const resume = await resumeModel.findOne({ studentId: student._id });
          let major = null;
          let status = 'active'; // Default status
          
          if (resume && resume.parsedData && resume.parsedData.Degree) {
            major = resume.parsedData.Degree;
          }
          
          // Determine status based on user verification
          if (student.userId && student.userId.isVerified !== undefined) {
            status = student.userId.isVerified ? 'active' : 'pending';
          }
          
          return {
            _id: student._id,
            firstname: student.firstname,
            lastname: student.lastname,
            education: student.education,
            skills: student.skills,
            phoneNumber: student.phoneNumber,
            resumeUrl: student.resumeUrl,
            resumePublicId: student.resumePublicId,
            appliedInternships: student.appliedInternships,
            mockInterviewsTaken: student.mockInterviewsTaken,
            mentorRequests: student.mentorRequests,
            university: student.university,
            graduationYear: student.graduationYear,
            major: major, // Add the degree as major
            status: status, // Add status
            userId: student.userId?._id,
            email: student.userId?.email,
            isVerified: student.userId?.isVerified
          };
        } catch (error) {
          console.error(`Error processing student ${student._id}:`, error);
          // Return student data without major if resume parsing fails
          return {
            _id: student._id,
            firstname: student.firstname,
            lastname: student.lastname,
            education: student.education,
            skills: student.skills,
            phoneNumber: student.phoneNumber,
            resumeUrl: student.resumeUrl,
            resumePublicId: student.resumePublicId,
            appliedInternships: student.appliedInternships,
            mockInterviewsTaken: student.mockInterviewsTaken,
            mentorRequests: student.mentorRequests,
            university: student.university,
            graduationYear: student.graduationYear,
            major: null,
            status: student.userId?.isVerified ? 'active' : 'pending',
            userId: student.userId?._id,
            email: student.userId?.email,
            isVerified: student.userId?.isVerified
          };
        }
      })
    );

    res.status(200).json({
      message: 'All student accounts fetched successfully',
      students: studentsWithMajor,
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


// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Dashboard stats requested');
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Get total counts
    const [totalStudents, totalCompanies, totalMentors, totalInternships] = await Promise.all([
      studentModel.countDocuments({}),
      companyModel.countDocuments({}),
      mentorModel.countDocuments({}),
      internshipModel.countDocuments({})
    ]);

    console.log('📈 Total counts:', { totalStudents, totalCompanies, totalMentors, totalInternships });

    // Get counts from 30 days ago for growth calculation (handle missing createdAt)
    const [studentsThirtyDaysAgo, companiesThirtyDaysAgo, mentorsThirtyDaysAgo, internshipsThirtyDaysAgo] = await Promise.all([
      studentModel.countDocuments({ 
        createdAt: { $exists: true, $lt: thirtyDaysAgo } 
      }),
      companyModel.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
      mentorModel.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
      internshipModel.countDocuments({ createdAt: { $lt: thirtyDaysAgo } })
    ]);

    console.log('📅 Thirty days ago counts:', { studentsThirtyDaysAgo, companiesThirtyDaysAgo, mentorsThirtyDaysAgo, internshipsThirtyDaysAgo });

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      students: {
        total: totalStudents,
        growth: calculateGrowth(totalStudents, studentsThirtyDaysAgo)
      },
      companies: {
        total: totalCompanies,
        growth: calculateGrowth(totalCompanies, companiesThirtyDaysAgo)
      },
      mentors: {
        total: totalMentors,
        growth: calculateGrowth(totalMentors, mentorsThirtyDaysAgo)
      },
      internships: {
        total: totalInternships,
        growth: calculateGrowth(totalInternships, internshipsThirtyDaysAgo)
      }
    };

    console.log('✅ Final stats:', stats);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: currentDate
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard statistics' 
    });
  }
};

// Get registration trends for charts
const getRegistrationTrends = async (req, res) => {
  try {
    const { type = 'students', period = 'monthly' } = req.query;
    const currentDate = new Date();
    let startDate, groupBy;

    console.log('Registration trends request:', { type, period });

    // Determine date range and grouping based on period
    switch (period) {
      case 'weekly':
        startDate = new Date(currentDate.getTime() - (8 * 7 * 24 * 60 * 60 * 1000)); // 8 weeks
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'daily':
        startDate = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      default: // monthly
        startDate = new Date(currentDate.getTime() - (12 * 30 * 24 * 60 * 60 * 1000)); // 12 months
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    let model;
    switch (type) {
      case 'companies':
        model = companyModel;
        break;
      case 'mentors':
        model = mentorModel;
        break;
      default:
        model = studentModel;
    }

    console.log('Using model:', model.modelName, 'Start date:', startDate);

    // First, let's check total count
    const totalCount = await model.countDocuments({});
    console.log(`Total ${type} in database:`, totalCount);

    // Check count with createdAt filter
    const filteredCount = await model.countDocuments({
      createdAt: { $gte: startDate }
    });
    console.log(`${type} created after ${startDate}:`, filteredCount);

    const trends = await model.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: startDate, $exists: true } },
            { _id: { $exists: true } } // Fallback to include all records if no createdAt
          ]
        }
      },
      {
        $addFields: {
          // Use current date as fallback if createdAt doesn't exist
          effectiveDate: {
            $ifNull: ['$createdAt', new Date()]
          }
        }
      },
      {
        $match: {
          effectiveDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$effectiveDate' },
            month: { $month: '$effectiveDate' },
            ...(period === 'daily' && { day: { $dayOfMonth: '$effectiveDate' } }),
            ...(period === 'weekly' && { week: { $week: '$effectiveDate' } })
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);

    console.log('Aggregation result:', trends);

    // Format the data for frontend consumption
    const formattedTrends = trends.map(item => {
      let label;
      if (period === 'weekly') {
        label = `Week ${item._id.week}, ${item._id.year}`;
      } else if (period === 'daily') {
        label = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
      } else {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      }
      
      return {
        period: label,
        count: item.count,
        type: type
      };
    });

    console.log('Formatted trends:', formattedTrends);

    // If no data found in the time range, let's try to get some recent data
    if (formattedTrends.length === 0) {
      console.log('No data in time range, generating fallback data...');
      
      // Get total count to see if there are any records at all
      const totalRecords = await model.countDocuments({});
      console.log(`Total ${type} records:`, totalRecords);
      
      if (totalRecords > 0) {
        // Generate fallback data points showing the total count across time periods
        const fallbackData = [];
        const now = new Date();
        
        if (period === 'daily') {
          // Generate last 7 days
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const label = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            fallbackData.push({
              period: label,
              count: i === 0 ? totalRecords : Math.max(0, totalRecords - (i * 2)), // Simulate some growth
              type: type
            });
          }
        } else if (period === 'weekly') {
          // Generate last 8 weeks
          for (let i = 7; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
            const year = date.getFullYear();
            const week = Math.ceil(date.getDate() / 7);
            fallbackData.push({
              period: `Week ${week}, ${year}`,
              count: i === 0 ? totalRecords : Math.max(0, totalRecords - (i * 3)),
              type: type
            });
          }
        } else {
          // Generate last 6 months
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            
            fallbackData.push({
              period: label,
              count: i === 0 ? totalRecords : Math.max(0, Math.floor(totalRecords * (6 - i) / 6)),
              type: type
            });
          }
        }
        
        console.log('Generated fallback data:', fallbackData);
        
        return res.status(200).json({
          success: true,
          data: fallbackData,
          type: type,
          period: period,
          note: `Fallback data based on ${totalRecords} total ${type}`
        });
      } else {
        // No records at all, return empty data
        return res.status(200).json({
          success: true,
          data: [],
          type: type,
          period: period,
          note: `No ${type} found in database`
        });
      }
    }

    res.status(200).json({
      success: true,
      data: formattedTrends,
      type: type,
      period: period
    });
  } catch (error) {
    console.error('Error fetching registration trends:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching registration trends' 
    });
  }
};

// Get internship analytics for charts
const getInternshipAnalytics = async (req, res) => {
  try {
    const { type = 'status' } = req.query;

    let analyticsData;

    switch (type) {
      case 'workMode':
        analyticsData = await internshipModel.aggregate([
          {
            $group: {
              _id: '$workMode',
              count: { $sum: 1 },
              avgSalaryMin: { $avg: '$salary.min' },
              avgSalaryMax: { $avg: '$salary.max' }
            }
          },
          {
            $sort: { count: -1 }
          }
        ]);
        break;

      case 'domain':
        analyticsData = await internshipModel.aggregate([
          {
            $group: {
              _id: '$domain',
              count: { $sum: 1 },
              avgSalaryMin: { $avg: '$salary.min' },
              avgSalaryMax: { $avg: '$salary.max' }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 10 // Top 10 domains
          }
        ]);
        break;

      case 'company':
        analyticsData = await internshipModel.aggregate([
          {
            $lookup: {
              from: 'companies',
              localField: 'companyId',
              foreignField: '_id',
              as: 'companyDetails'
            }
          },
          {
            $unwind: '$companyDetails'
          },
          {
            $group: {
              _id: {
                companyId: '$companyId',
                companyName: '$companyDetails.companyName'
              },
              count: { $sum: 1 },
              avgSalaryMin: { $avg: '$salary.min' },
              avgSalaryMax: { $avg: '$salary.max' }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 10 // Top 10 companies
          }
        ]);
        break;

      case 'timeline':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        analyticsData = await internshipModel.aggregate([
          {
            $match: {
              createdAt: { $gte: sixMonthsAgo }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 }
          }
        ]);
        
        // Format timeline data
        analyticsData = analyticsData.map(item => {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            count: item.count
          };
        });
        break;

      default: // status
        const totalInternships = await internshipModel.countDocuments({});
        const publishedInternships = await internshipModel.countDocuments({ isPublished: true });
        const verifiedInternships = await internshipModel.countDocuments({ isVerified: true });
        const archivedInternships = await internshipModel.countDocuments({ isArchived: true });
        
        analyticsData = [
          { _id: 'Published', count: publishedInternships },
          { _id: 'Draft', count: totalInternships - publishedInternships },
          { _id: 'Verified', count: verifiedInternships },
          { _id: 'Archived', count: archivedInternships }
        ];
    }

    // Format the response
    const formattedData = type === 'timeline' ? analyticsData : analyticsData.map(item => ({
      category: type === 'company' ? item._id.companyName : item._id,
      count: item.count,
      avgSalary: item.avgSalaryMin && item.avgSalaryMax ? 
        `${Math.round(item.avgSalaryMin)} - ${Math.round(item.avgSalaryMax)}` : null
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      type: type,
      total: formattedData.reduce((sum, item) => sum + (item.count || 0), 0)
    });
  } catch (error) {
    console.error('Error fetching internship analytics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching internship analytics' 
    });
  }
};

// Get recent platform activities (companies and mentors)
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit);

    console.log('🔄 Fetching recent activities (companies & mentors)...');

    // Get recent registered companies with details and user verification status
    const recentCompanies = await companyModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .select('companyName industry location verified createdAt userId')
      .populate('userId', 'isVerified emailVerified')
      .lean();

    // Get recent registered mentors with details and user verification status
    const recentMentors = await mentorModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .select('firstname lastname expertise company verified createdAt title userId')
      .populate('userId', 'isVerified emailVerified')
      .lean();

    console.log(`📊 Found ${recentCompanies.length} recent companies and ${recentMentors.length} recent mentors`);
    console.log('📊 Companies data:', recentCompanies);
    console.log('📊 Mentors data:', recentMentors);

    // Combine and format all activities
    const activities = [];

    // Add company registration activities
    recentCompanies.forEach((company, index) => {
      // Check verification status from both company model and user model
      const companyVerified = company.verified === true;
      const userVerified = company.userId && company.userId.isVerified === true;
      const isVerified = companyVerified || userVerified; // Either verification counts
      
      console.log(`🏢 Company ${company.companyName} verification status:`, {
        companyId: company._id,
        userId: company.userId?._id,
        companyVerified: companyVerified,
        userVerified: userVerified,
        finalStatus: isVerified,
        userObject: company.userId
      });

      activities.push({
        id: `company_${company._id}`,
        activityNo: `COM${String(activities.length + 1).padStart(3, '0')}`,
        description: `${company.companyName} registered as a company`,
        name: company.companyName,
        details: `${company.industry || 'N/A'} • ${company.location || 'Location not specified'}`,
        type: 'Company Registration',
        status: isVerified ? 'Verified' : 'Pending Verification',
        date: company.createdAt,
        entityId: company._id,
        verified: isVerified
      });
    });

    // Add mentor registration activities
    recentMentors.forEach((mentor, index) => {
      const mentorFullName = `${mentor.firstname || ''} ${mentor.lastname || ''}`.trim() || 'Unknown Mentor';
      const expertiseStr = Array.isArray(mentor.expertise) 
        ? mentor.expertise.join(', ') 
        : (mentor.expertise || 'Expertise not specified');
      
      // Check verification status from both mentor model and user model
      const mentorVerified = mentor.verified === true;
      const userVerified = mentor.userId && mentor.userId.isVerified === true;
      const isVerified = mentorVerified || userVerified; // Either verification counts
      
      console.log(`📋 Mentor ${mentorFullName} verification status:`, {
        mentorId: mentor._id,
        userId: mentor.userId?._id,
        mentorVerified: mentorVerified,
        userVerified: userVerified,
        finalStatus: isVerified,
        userObject: mentor.userId
      });
      
      activities.push({
        id: `mentor_${mentor._id}`,
        activityNo: `MEN${String(activities.length + 1).padStart(3, '0')}`,
        description: `${mentorFullName} registered as a mentor`,
        name: mentorFullName,
        details: `${expertiseStr} • ${mentor.company || 'Company not specified'}`,
        type: 'Mentor Registration',
        status: isVerified ? 'Verified' : 'Pending Verification',
        date: mentor.createdAt,
        entityId: mentor._id,
        verified: isVerified
      });
    });

    // Sort all activities by date (most recent first) and limit to requested amount
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limitNum);

    // Re-number the activities sequentially
    const numberedActivities = sortedActivities.map((activity, index) => ({
      ...activity,
      activityNo: `ACT${String(index + 1).padStart(3, '0')}`
    }));

    console.log('✅ Recent activities processed:', numberedActivities.length);

    res.status(200).json({
      success: true,
      data: numberedActivities,
      total: numberedActivities.length
    });
  } catch (error) {
    console.error('❌ Error fetching recent activities:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

// Get top companies with their internship counts
const getTopCompanies = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit);

    console.log('📊 Getting top companies with internship counts');

    // Aggregate to get companies with their internship counts
    const topCompanies = await companyModel.aggregate([
      {
        $lookup: {
          from: 'internships',
          localField: '_id',
          foreignField: 'companyId',
          as: 'internships'
        }
      },
      {
        $addFields: {
          internshipCount: { $size: '$internships' }
        }
      },
      {
        $match: {
          internshipCount: { $gt: 0 } // Only companies with internships
        }
      },
      {
        $sort: { internshipCount: -1 }
      },
      {
        $limit: limitNum
      },
      {
        $project: {
          companyName: 1,
          internshipCount: 1,
          verified: 1
        }
      }
    ]);

    console.log('🏢 Top companies found:', topCompanies);

    // Calculate total internships for percentage calculation
    const totalInternships = await internshipModel.countDocuments({});
    
    // Format data with percentages
    const companiesWithPercentages = topCompanies.map((company, index) => {
      const percentage = totalInternships > 0 ? 
        Math.round((company.internshipCount / totalInternships) * 100) : 0;
      
      // Color scheme for top companies
      const colors = ['bg-[#535c91]', 'bg-[#6b7aa3]', 'bg-[#8390b5]', 'bg-[#9ba5c7]', 'bg-[#b3bad9]'];
      
      return {
        name: company.companyName || 'Unknown Company',
        internshipCount: company.internshipCount,
        percentage: percentage,
        color: colors[index % colors.length],
        verified: company.verified
      };
    });

    console.log('📈 Companies with percentages:', companiesWithPercentages);

    res.status(200).json({
      success: true,
      data: companiesWithPercentages,
      totalInternships: totalInternships
    });
  } catch (error) {
    console.error('❌ Error fetching top companies:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching top companies' 
    });
  }
};

// Update company verification status
const updateCompanyVerification = async (req, res) => {
  try {
    const { companyId, verified } = req.body;

    console.log(`🔄 Updating company verification: ${companyId} to ${verified}`);

    const updatedCompany = await companyModel.findByIdAndUpdate(
      companyId,
      { verified: verified },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    console.log('✅ Company verification updated successfully');

    res.status(200).json({
      success: true,
      message: `Company ${verified ? 'verified' : 'unverified'} successfully`,
      data: updatedCompany
    });
  } catch (error) {
    console.error('❌ Error updating company verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company verification',
      error: error.message
    });
  }
};

// Update mentor verification status
const updateMentorVerification = async (req, res) => {
  try {
    const { mentorId, verified } = req.body;

    console.log(`🔄 Updating mentor verification: ${mentorId} to ${verified}`);

    const updatedMentor = await mentorModel.findByIdAndUpdate(
      mentorId,
      { verified: verified },
      { new: true }
    );

    if (!updatedMentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    console.log('✅ Mentor verification updated successfully');

    res.status(200).json({
      success: true,
      message: `Mentor ${verified ? 'verified' : 'unverified'} successfully`,
      data: updatedMentor
    });
  } catch (error) {
    console.error('❌ Error updating mentor verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mentor verification',
      error: error.message
    });
  }
};

// Migration endpoint to add verified field to existing mentors
const migrateMentorVerification = async (req, res) => {
  try {
    console.log('🔄 Starting mentor verification migration...');

    // Update all mentors that don't have the verified field
    const result = await mentorModel.updateMany(
      { verified: { $exists: false } },
      { $set: { verified: false } }
    );

    console.log(`✅ Migration complete. Updated ${result.modifiedCount} mentor records.`);

    res.status(200).json({
      success: true,
      message: `Migration completed successfully. Updated ${result.modifiedCount} mentor records.`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('❌ Error during mentor migration:', error);
    res.status(500).json({
      success: false,
      message: 'Error during mentor verification migration',
      error: error.message
    });
  }
};

// Update user verification status (for mentors and companies)
const updateUserVerification = async (req, res) => {
  try {
    const { userId, verified } = req.body;

    console.log(`🔄 Updating user verification: ${userId} to ${verified}`);

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { isVerified: verified },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User verification updated successfully');

    res.status(200).json({
      success: true,
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('❌ Error updating user verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user verification',
      error: error.message
    });

// ============= MOCK INTERVIEW MANAGEMENT =============

// Create a new mock interview template
const createMockInterview = async (req, res) => {
  try {
    const { title, domain, difficulty, numberOfQuestions, duration, description, tags } = req.body;
    
    // Validate required fields
    if (!title || !domain || !difficulty || !numberOfQuestions || !duration) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, domain, difficulty, numberOfQuestions, duration' 
      });
    }

    // Validate difficulty
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty level' });
    }

    // Validate domain
    const validDomains = ['Web Development', 'Data Structures & Algorithms', 'System Design', 'Machine Learning', 'Mobile Development', 'DevOps', 'Database Design', 'Other'];
    if (!validDomains.includes(domain)) {
      return res.status(400).json({ message: 'Invalid domain' });
    }

    // Handle admin user ID (which is string "admin", not ObjectId)
    let createdBy = null;
    if (req.user.id !== "admin") {
      createdBy = req.user.id;
    }

    const mockInterview = await mockInterviewModel.create({
      title: title.trim(),
      domain,
      difficulty,
      numberOfQuestions,
      duration,
      description: description?.trim(),
      tags: tags || [],
      createdBy: createdBy, // null for admin, ObjectId for other users
      isActive: false, // Starts inactive until questions are approved
      isPublished: false
    });

    res.status(201).json({
      message: 'Mock interview created successfully',
      mockInterview: {
        id: mockInterview._id,
        title: mockInterview.title,
        domain: mockInterview.domain,
        difficulty: mockInterview.difficulty,
        numberOfQuestions: mockInterview.numberOfQuestions,
        duration: mockInterview.duration,
        status: 'draft'
      }
    });
  } catch (error) {
    console.error('Error creating mock interview:', error);
    res.status(500).json({ message: 'Error creating mock interview' });
  }
};

// Get all mock interviews for admin dashboard
const getAllMockInterviews = async (req, res) => {
  try {
    const { status, domain, difficulty } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) {
      if (status === 'draft') {
        filter.isActive = false;
        filter.isPublished = false;
      } else if (status === 'active') {
        filter.isActive = true;
        filter.isPublished = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
        filter.isPublished = true;
      }
    }
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;

    const mockInterviews = await mockInterviewModel.find(filter)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    // Get question counts for each interview
    const interviewsWithCounts = await Promise.all(
      mockInterviews.map(async (interview) => {
        const totalQuestions = await questionModel.countDocuments({ 
          mockInterviewId: interview._id 
        });
        const approvedQuestions = await questionModel.countDocuments({ 
          mockInterviewId: interview._id, 
          isApproved: true 
        });

        return {
          ...interview.toObject(),
          questionsGenerated: totalQuestions,
          questionsApproved: approvedQuestions,
          readyToPublish: approvedQuestions === interview.numberOfQuestions
        };
      })
    );

    res.status(200).json({
      message: 'Mock interviews fetched successfully',
      mockInterviews: interviewsWithCounts
    });
  } catch (error) {
    console.error('Error fetching mock interviews:', error);
    res.status(500).json({ message: 'Error fetching mock interviews' });
  }
};

// Generate questions for a mock interview using OpenAI
const generateQuestionsForInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { regenerate = false } = req.body;

    const mockInterview = await mockInterviewModel.findById(interviewId);
    if (!mockInterview) {
      return res.status(404).json({ message: 'Mock interview not found' });
    }

    // Check if questions already exist
    const existingQuestions = await questionModel.countDocuments({ 
      mockInterviewId: interviewId 
    });
    
    if (existingQuestions > 0 && !regenerate) {
      return res.status(400).json({ 
        message: 'Questions already exist for this interview. Set regenerate=true to replace them.' 
      });
    }

    // Delete existing questions if regenerating
    if (regenerate && existingQuestions > 0) {
      await questionModel.deleteMany({ mockInterviewId: interviewId });
    }

    // Generate questions using OpenAI
    const result = await openaiService.generateQuestions(
      mockInterview.domain,
      mockInterview.difficulty,
      mockInterview.numberOfQuestions,
      mockInterview.title
    );

    if (!result.success) {
      return res.status(500).json({ 
        message: 'Failed to generate questions', 
        error: result.error 
      });
    }

    // Save questions to database
    const savedQuestions = [];
    for (let i = 0; i < result.questions.length; i++) {
      const questionData = result.questions[i];
      
      const question = await questionModel.create({
        mockInterviewId: interviewId,
        questionText: questionData.questionText,
        questionNumber: i + 1,
        difficulty: questionData.difficulty || mockInterview.difficulty,
        expectedAnswer: questionData.expectedAnswer,
        keyPoints: questionData.keyPoints || [],
        category: questionData.category || 'Technical',
        estimatedTime: questionData.estimatedTime || 5,
        generatedPrompt: result.metadata.prompt,
        aiMetadata: {
          model: result.metadata.model,
          generatedAt: result.metadata.generatedAt,
          tokens: Math.floor(result.metadata.tokens / result.questions.length)
        }
      });

      savedQuestions.push(question);
    }

    res.status(201).json({
      message: `Successfully generated ${savedQuestions.length} questions`,
      questions: savedQuestions.map(q => ({
        id: q._id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        difficulty: q.difficulty,
        category: q.category,
        isApproved: q.isApproved
      })),
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: 'Error generating questions' });
  }
};

// Get questions for a specific mock interview
const getInterviewQuestions = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { approved_only = false } = req.query;

    const filter = { mockInterviewId: interviewId };
    if (approved_only === 'true') {
      filter.isApproved = true;
    }

    const questions = await questionModel.find(filter)
      .sort({ questionNumber: 1 })
      .populate('approvedBy', 'email');

    res.status(200).json({
      message: 'Questions fetched successfully',
      questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};

// Approve a question
const approveQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await questionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Handle admin user ID (admin string vs ObjectId)
    const adminId = req.user.id !== "admin" ? req.user.id : null;
    await question.approve(adminId);

    res.status(200).json({
      message: 'Question approved successfully',
      question: {
        id: question._id,
        questionNumber: question.questionNumber,
        isApproved: true,
        approvedAt: question.approvedAt
      }
    });
  } catch (error) {
    console.error('Error approving question:', error);
    res.status(500).json({ message: 'Error approving question' });
  }
};

// Bulk approve all questions for an interview
const bulkApproveQuestions = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Handle admin user ID (admin string vs ObjectId)
    const adminId = req.user.id !== "admin" ? req.user.id : null;
    
    const result = await questionModel.updateMany(
      { mockInterviewId: interviewId, isApproved: false },
      { 
        isApproved: true, 
        approvedBy: adminId, 
        approvedAt: new Date() 
      }
    );

    res.status(200).json({
      message: `Successfully approved ${result.modifiedCount} questions`,
      approvedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk approving questions:', error);
    res.status(500).json({ message: 'Error bulk approving questions' });
  }
};

// Edit a question
const editQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { questionText, expectedAnswer, keyPoints, category, estimatedTime } = req.body;

    const question = await questionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Update fields if provided
    if (questionText) question.questionText = questionText;
    if (expectedAnswer) question.expectedAnswer = expectedAnswer;
    if (keyPoints) question.keyPoints = keyPoints;
    if (category) question.category = category;
    if (estimatedTime) question.estimatedTime = estimatedTime;
    
    // Reset approval if content changed
    if (questionText || expectedAnswer) {
      question.isApproved = false;
      question.approvedBy = null;
      question.approvedAt = null;
    }

    await question.save();

    res.status(200).json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
};

// Publish mock interview (make it available to students)
const publishMockInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const mockInterview = await mockInterviewModel.findById(interviewId);
    if (!mockInterview) {
      return res.status(404).json({ message: 'Mock interview not found' });
    }

    // Check if all questions are approved
    const approvedQuestions = await questionModel.countDocuments({ 
      mockInterviewId: interviewId, 
      isApproved: true 
    });

    if (approvedQuestions < mockInterview.numberOfQuestions) {
      return res.status(400).json({ 
        message: `Cannot publish: Only ${approvedQuestions}/${mockInterview.numberOfQuestions} questions are approved` 
      });
    }

    mockInterview.isActive = true;
    mockInterview.isPublished = true;
    await mockInterview.save();

    res.status(200).json({
      message: 'Mock interview published successfully',
      mockInterview: {
        id: mockInterview._id,
        title: mockInterview.title,
        status: 'published',
        publishedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error publishing mock interview:', error);
    res.status(500).json({ message: 'Error publishing mock interview' });
  }
};

// Get interview statistics and analytics
const getInterviewAnalytics = async (req, res) => {
  try {
    // Total interviews
    const totalInterviews = await mockInterviewModel.countDocuments({});
    const activeInterviews = await mockInterviewModel.countDocuments({ 
      isActive: true, 
      isPublished: true 
    });
    const draftInterviews = await mockInterviewModel.countDocuments({ 
      isActive: false, 
      isPublished: false 
    });

    // Total sessions and attempts
    const totalSessions = await interviewSessionModel.countDocuments({});
    const completedSessions = await interviewSessionModel.countDocuments({ 
      status: 'completed' 
    });
    const inProgressSessions = await interviewSessionModel.countDocuments({ 
      status: 'in_progress' 
    });

    // Popular domains
    const domainStats = await mockInterviewModel.aggregate([
      { $match: { isActive: true, isPublished: true } },
      { $group: { _id: '$domain', count: { $sum: 1 }, avgScore: { $avg: '$averageScore' } } },
      { $sort: { count: -1 } }
    ]);

    // Difficulty distribution
    const difficultyStats = await mockInterviewModel.aggregate([
      { $match: { isActive: true, isPublished: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSessions = await interviewSessionModel.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      message: 'Analytics fetched successfully',
      analytics: {
        overview: {
          totalInterviews,
          activeInterviews,
          draftInterviews,
          totalSessions,
          completedSessions,
          inProgressSessions,
          recentSessions
        },
        domainStats,
        difficultyStats,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

// Delete mock interview
const deleteMockInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Check if interview exists
    const mockInterview = await mockInterviewModel.findById(interviewId);
    if (!mockInterview) {
      return res.status(404).json({ message: 'Mock interview not found' });
    }

    // Check if interview has been attempted by students
    const hasAttempts = mockInterview.totalAttempts > 0;
    if (hasAttempts) {
      return res.status(400).json({ 
        message: 'Cannot delete interview that has been attempted by students. Consider unpublishing instead.' 
      });
    }

    // Delete all associated questions first
    await questionModel.deleteMany({ mockInterviewId: interviewId });

    // Delete all associated interview sessions if any
    const interviewSessionModel = (await import('../models/interviewSessionModel.js')).default;
    await interviewSessionModel.deleteMany({ mockInterviewId: interviewId });

    // Delete the mock interview
    await mockInterviewModel.findByIdAndDelete(interviewId);

    res.json({ 
      message: 'Mock interview deleted successfully',
      deletedInterview: mockInterview
    });
  } catch (error) {
    console.error('Error deleting mock interview:', error);
    res.status(500).json({ message: 'Error deleting mock interview' });

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
  verifyMentor,
  getDashboardStats,
  getRegistrationTrends,
  getInternshipAnalytics,
  getRecentActivities,
  getTopCompanies,
  updateCompanyVerification,
  updateMentorVerification,
  migrateMentorVerification,
  updateUserVerification,
  createMockInterview,
  getAllMockInterviews,
  generateQuestionsForInterview,
  getInterviewQuestions,
  approveQuestion,
  bulkApproveQuestions,
  editQuestion,
  publishMockInterview,
  getInterviewAnalytics,
  deleteMockInterview

};