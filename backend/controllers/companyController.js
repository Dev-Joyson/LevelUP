import internshipModel from '../models/internshipModel.js';
import companyModel from '../models/companyModel.js';
import applicationModel from '../models/applicationModel.js';
import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const companyDashboard = (req, res) => {
    res.json({ message: "Welcome to the Company Dashboard", user: req.user });
  };
  
// Create a new internship with enhanced matching criteria
const createInternship = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Fetch company name for embedding
    const company = await companyModel.findOne({ userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    const companyId = company._id;

    // Accept all relevant fields from the request body
    const {
      title,
      description,
      aboutRole,
      domain,
      duration,
      location,
      salary = {},
      workMode,
      criteria = {},
      qualifications = [],
      requirements = [],
      benefits = [],
      matchingCriteria = {},
      preferredSkills = [],
      minimumGPA = 0,
      applicationDeadline,
      positions = 1,
      isPublished = false,
      isVerified = false,
      isArchived = false
    } = req.body;

    // Validate required fields
    if (!title || !description || !domain || !duration || !location || !workMode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!salary.min || !salary.max) {
      return res.status(400).json({ message: 'Salary min and max are required' });
    }
    if (typeof salary.min !== 'number' || typeof salary.max !== 'number' || salary.min < 0 || salary.max < salary.min) {
      return res.status(400).json({ message: 'Salary min and max must be valid numbers and max >= min' });
    }
    if (!Array.isArray(requirements)) {
      return res.status(400).json({ message: 'Requirements must be an array' });
    }
    if (!Array.isArray(benefits)) {
      return res.status(400).json({ message: 'Benefits must be an array' });
    }
    if (!Array.isArray(qualifications)) {
      return res.status(400).json({ message: 'Qualifications must be an array' });
    }
    if (criteria.skills && !Array.isArray(criteria.skills)) {
      return res.status(400).json({ message: 'Criteria.skills must be an array' });
    }
    if (preferredSkills && !Array.isArray(preferredSkills)) {
      return res.status(400).json({ message: 'PreferredSkills must be an array' });
    }

    // Validate matching criteria
    const defaultMatchingCriteria = {
      skills: 40,
      projects: 30,
      experience: 20,
      gpa: 5,
      certifications: 5
    };

    const finalMatchingCriteria = { ...defaultMatchingCriteria, ...matchingCriteria };
    
    // Validate that all percentages are valid numbers
    Object.keys(finalMatchingCriteria).forEach(key => {
      const value = finalMatchingCriteria[key];
      if (typeof value !== 'number' || value < 0 || value > 100) {
        return res.status(400).json({ 
          message: `${key} percentage must be a number between 0 and 100` 
        });
      }
    });

    // Validate that percentages sum to 100
    const total = Object.values(finalMatchingCriteria).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.01) {
      return res.status(400).json({ 
        message: `Matching criteria must sum to 100%. Current total: ${total}%` 
      });
    }

    // Validate application deadline
    if (applicationDeadline && new Date(applicationDeadline) <= new Date()) {
      return res.status(400).json({ 
        message: 'Application deadline must be in the future' 
      });
    }

    // Build the internship object
    const internshipData = {
      companyId,
      company: { name: company.companyName },
      title,
      description,
      aboutRole: aboutRole || '',
      domain,
      duration,
      location,
      salary: {
        min: salary.min,
        max: salary.max,
        display: salary.display || `${salary.min} - ${salary.max}`
      },
      workMode,
      criteria: {
        skills: criteria.skills || [],
        education: criteria.education || ''
      },
      qualifications,
      requirements,
      benefits,
      matchingCriteria: finalMatchingCriteria,
      preferredSkills,
      minimumGPA: Number(minimumGPA) || 0,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      positions: Number(positions) || 1,
      isPublished,
      isVerified,
      isArchived
    };

    const internship = await internshipModel.create(internshipData);

    // Add internship to company's internships array
    company.internships.push(internship._id);
    await company.save();

    res.status(201).json({ message: 'Internship created successfully', internship });
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ message: 'Failed to create internship', error: error.message });
  }
};

// Note: Company application functions moved to applicationController.js

// Note: Application status update function moved to applicationController.js

// Get application analytics
const getApplicationAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const company = await companyModel.findOne({ userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get application statistics
    const totalApplications = await applicationModel.countDocuments({ companyId: company._id });
    
    const statusCounts = await applicationModel.aggregate([
      { $match: { companyId: company._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const averageMatchScore = await applicationModel.aggregate([
      { $match: { companyId: company._id } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore.total' } } }
    ]);

    const topInternships = await applicationModel.aggregate([
      { $match: { companyId: company._id } },
      { $group: { _id: '$internshipId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'internships', localField: '_id', foreignField: '_id', as: 'internship' } },
      { $unwind: '$internship' },
      { $project: { title: '$internship.title', count: 1 } }
    ]);

    res.json({
      totalApplications,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      averageMatchScore: averageMatchScore[0]?.avgScore || 0,
      topInternships
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
};

// Update internship matching criteria
const updateInternshipCriteria = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { internshipId } = req.params;
    const { matchingCriteria, preferredSkills, minimumGPA } = req.body;

    const company = await companyModel.findOne({ userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Validate matching criteria if provided
    if (matchingCriteria) {
      const total = Object.values(matchingCriteria).reduce((sum, val) => sum + val, 0);
      if (Math.abs(total - 100) > 0.01) {
        return res.status(400).json({ 
          message: `Matching criteria must sum to 100%. Current total: ${total}%` 
        });
      }
    }

    const updateData = {};
    if (matchingCriteria) updateData.matchingCriteria = matchingCriteria;
    if (preferredSkills) updateData.preferredSkills = preferredSkills;
    if (minimumGPA !== undefined) updateData.minimumGPA = Number(minimumGPA);

    const internship = await internshipModel.findOneAndUpdate(
      { _id: internshipId, companyId: company._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.json({ 
      message: 'Internship criteria updated successfully',
      internship 
    });

  } catch (error) {
    console.error('Update criteria error:', error);
    res.status(500).json({ 
      message: 'Failed to update internship criteria',
      error: error.message 
    });
  }
};

// Get all internships posted by a company
const getCompanyInternships = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      status, 
      domain, 
      workMode, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1, 
      limit = 10 
    } = req.query;

    // Get company
    const company = await companyModel.findOne({ userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Build query filters
    const query = { companyId: company._id };
    
    // Add optional filters
    if (status) {
      if (status === 'published') {
        query.isPublished = true;
        query.isArchived = false;
      } else if (status === 'draft') {
        query.isPublished = false;
        query.isArchived = false;
      } else if (status === 'archived') {
        query.isArchived = true;
      }
    }
    
    if (domain) {
      query.domain = { $regex: domain, $options: 'i' };
    }
    
    if (workMode) {
      query.workMode = workMode;
    }

    // Build sort criteria
    const validSortFields = ['createdAt', 'title', 'applicationDeadline', 'positions'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortCriteria = { [sortField]: sortDirection };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get internships with pagination
    const internships = await internshipModel
      .find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .select('-__v'); // Exclude version field

    // Get total count for pagination
    const total = await internshipModel.countDocuments(query);

    // Calculate statistics
    const stats = {
      total,
      published: await internshipModel.countDocuments({ 
        companyId: company._id, 
        isPublished: true, 
        isArchived: false 
      }),
      draft: await internshipModel.countDocuments({ 
        companyId: company._id, 
        isPublished: false, 
        isArchived: false 
      }),
      archived: await internshipModel.countDocuments({ 
        companyId: company._id, 
        isArchived: true 
      })
    };

    // Add application count for each internship
    const internshipsWithStats = await Promise.all(
      internships.map(async (internship) => {
        const applicationCount = await applicationModel.countDocuments({
          internshipId: internship._id
        });
        
        return {
          ...internship.toObject(),
          applicationCount,
          isExpired: internship.applicationDeadline && new Date() > internship.applicationDeadline
        };
      })
    );

    res.json({
      success: true,
      data: {
        internships: internshipsWithStats,
        stats,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: skip + limitNum < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get company internships error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch internships',
      error: error.message 
    });
  }
};

// Get company profile
const getCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find company with user details
    const company = await companyModel.findOne({ userId }).populate('userId', 'email');
    
    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company profile not found' 
      });
    }

    res.json({
      success: true,
      data: company
    });

  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch company profile',
      error: error.message 
    });
  }
};

// Update company profile
const updateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      companyName,
      description,
      website,
      industry,
      location,
      foundedYear,
      employees
    } = req.body;

    // Find and update company
    const company = await companyModel.findOneAndUpdate(
      { userId },
      {
        companyName,
        description,
        website,
        industry,
        location,
        foundedYear,
        employees
      },
      { new: true, runValidators: true }
    ).populate('userId', 'email');

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company profile not found' 
      });
    }

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      data: company
    });

  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update company profile',
      error: error.message 
    });
  }
};

// Get dashboard analytics and stats
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { timeRange = '30' } = req.query; // days: 30, 90, 180

    // First, find the company document using the user ID
    const company = await companyModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    const companyId = company._id;
    console.log(`🏢 Dashboard for Company: ${company.companyName} (ID: ${companyId})`);

    // Calculate date range
    const now = new Date();
    const daysBack = parseInt(timeRange);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get company's internships
    const companyInternships = await internshipModel.find({ 
      companyId: new mongoose.Types.ObjectId(companyId) 
    }).select('_id title');

    console.log(`📊 Found ${companyInternships.length} internships for this company`);

    const internshipIds = companyInternships.map(int => int._id);

    // Dashboard Stats
    const [
      totalInternships,
      totalApplications,
      pendingApplications,
      approvedApplications
    ] = await Promise.all([
      // Total internships by this company
      internshipModel.countDocuments({ companyId: companyId }),
      
      // Total applications for company's internships
      applicationModel.countDocuments({ 
        companyId: companyId
      }),
      
      // Pending reviews (pending + reviewed status)
      applicationModel.countDocuments({ 
        companyId: companyId,
        status: { $in: ['pending', 'reviewed'] }
      }),
      
      // Approved this month (accepted + shortlisted)
      applicationModel.countDocuments({ 
        companyId: companyId,
        status: { $in: ['accepted', 'shortlisted'] },
        updatedAt: { $gte: startDate }
      })
    ]);

    console.log(`📈 Stats - Internships: ${totalInternships}, Applications: ${totalApplications}, Pending: ${pendingApplications}, Approved: ${approvedApplications}`);

    // Analytics Data

    // 1. Applications over time (daily for last period)
    const applicationsOverTime = await applicationModel.aggregate([
      {
        $match: {
          companyId: companyId,
          appliedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$appliedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Application status breakdown
    const statusBreakdown = await applicationModel.aggregate([
      {
        $match: {
          companyId: companyId
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Top internship positions by applications
    const topPositions = await applicationModel.aggregate([
      {
        $match: {
          companyId: companyId
        }
      },
      {
        $lookup: {
          from: 'internships',
          localField: 'internshipId',
          foreignField: '_id',
          as: 'internship'
        }
      },
      {
        $unwind: '$internship'
      },
      {
        $group: {
          _id: '$internship.title',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Recent internships with application counts
    const recentInternships = await internshipModel.aggregate([
      {
        $match: {
          companyId: companyId
        }
      },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'internshipId',
          as: 'applications'
        }
      },
      {
        $project: {
          title: 1,
          location: 1,
          jobType: 1,
          isActive: 1,
          createdAt: 1,
          applicationCount: { $size: '$applications' }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 10 }
    ]);

    console.log(`📊 Analytics - Applications over time: ${applicationsOverTime.length} data points`);
    console.log(`📊 Analytics - Status breakdown:`, statusBreakdown);
    console.log(`📊 Analytics - Top positions:`, topPositions);
    console.log(`📊 Analytics - Recent internships: ${recentInternships.length}`);

    res.json({
      success: true,
      data: {
        stats: {
          totalInternships,
          totalApplications,
          pendingReviews: pendingApplications,
          studentsApproved: approvedApplications
        },
        analytics: {
          applicationsOverTime,
          statusBreakdown,
          topPositions
        },
        recentInternships
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard analytics' 
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
  companyDashboard, 
  createInternship, 
  getCompanyInternships,
  getApplicationAnalytics,
  updateInternshipCriteria,
  getCompanyProfile,
  updateCompanyProfile,
  getDashboardAnalytics,
  changePassword
  // Note: Application-related functions moved to applicationController.js
};
  