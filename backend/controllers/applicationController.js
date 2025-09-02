import applicationModel from '../models/applicationModel.js';
import studentModel from '../models/studentModel.js';
import companyModel from '../models/companyModel.js';

// Get applications for a student
const getStudentApplications = async (req, res) => {
  try {
    console.log('Getting applications for user ID:', req.user.userId);
    
    // First, find the student document using the userId from the JWT token
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    console.log('Found student with ID:', student._id);
    
    // Find all applications with this student's ID
    const applications = await applicationModel.find({ studentId: student._id })
      .populate('internshipId', 'title companyId domain location workMode salary duration startDate')
      .populate({
        path: 'internshipId',
        populate: {
          path: 'companyId',
          select: 'name logo website industry size'
        }
      })
      .sort({ appliedAt: -1 });
    
    console.log(`Found ${applications.length} applications`);
    
    // Debug: Log population results
    const populationStats = {
      totalApps: applications.length,
      withInternship: applications.filter(app => app.internshipId).length,
      withCompany: applications.filter(app => app.internshipId?.companyId).length,
      withCompanyName: applications.filter(app => app.internshipId?.companyId?.name).length
    };
    console.log('📊 Population Stats:', populationStats);
    
    // Transform the data for frontend use
    const transformedApplications = applications.map(app => {
      // Debug: Log individual application data
      console.log('🔍 Processing application:', {
        appId: app._id,
        internshipId: app.internshipId?._id,
        companyData: app.internshipId?.companyId,
        hasInternship: !!app.internshipId,
        hasCompany: !!app.internshipId?.companyId
      });
      
      return {
        id: app._id,
        company: app.internshipId?.companyId?.name || 
                app.internshipId?.company?.name || // Fallback to embedded company name
                'Unknown Company',
        companyLogo: app.internshipId?.companyId?.logo || null,
        role: app.internshipId?.title || 'Unknown Position',
        applicationDate: app.appliedAt,
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1), // Capitalize status
        matchScore: app.matchScore?.total || 0,
        internshipId: app.internshipId?._id || null,
        coverLetter: app.coverLetter,
        resumeUrl: app.resumeUrl,
        // Include additional internship details
        internshipDetails: app.internshipId ? {
          domain: app.internshipId.domain,
          location: app.internshipId.location,
          workMode: app.internshipId.workMode,
          salary: app.internshipId.salary,
          duration: app.internshipId.duration,
          startDate: app.internshipId.startDate,
          company: app.internshipId.company // Include embedded company data
        } : null,
        // Include additional company details
        companyDetails: app.internshipId?.companyId ? {
          name: app.internshipId.companyId.name,
          logo: app.internshipId.companyId.logo,
          website: app.internshipId.companyId.website,
          industry: app.internshipId.companyId.industry,
          size: app.internshipId.companyId.size
        } : null
      };
    });

    // Debug: Log final transformed data sample
    console.log('📤 Final transformed data sample:', {
      count: transformedApplications.length,
      firstApp: transformedApplications[0] ? {
        id: transformedApplications[0].id,
        company: transformedApplications[0].company,
        hasCompanyDetails: !!transformedApplications[0].companyDetails
      } : 'No applications',
      companiesFound: transformedApplications.filter(app => app.company !== 'Unknown Company').length
    });

    res.status(200).json(transformedApplications);
  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

// Get single application detail by ID
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    // Find the student to verify ownership
    const student = await studentModel.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find the application and verify it belongs to this student
    const application = await applicationModel.findOne({
      _id: applicationId,
      studentId: student._id
    })
    .populate('internshipId')
    .populate({
      path: 'internshipId',
      populate: {
        path: 'companyId',
        select: 'name logo website industry size description'
      }
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found or access denied' });
    }
    
    // Return detailed application data
    const applicationDetail = {
      id: application._id,
      studentId: application.studentId,
      internshipId: application.internshipId._id,
      companyId: application.internshipId.companyId._id,
      company: application.internshipId.companyId.name,
      companyLogo: application.internshipId.companyId.logo,
      companyDescription: application.internshipId.companyId.description,
      role: application.internshipId.title,
      domain: application.internshipId.domain,
      location: application.internshipId.location,
      workMode: application.internshipId.workMode,
      salary: application.internshipId.salary,
      duration: application.internshipId.duration,
      startDate: application.internshipId.startDate,
      applicationDate: application.appliedAt,
      status: application.status,
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
      matchScore: application.matchScore,
      notes: application.notes
    };
    
    res.status(200).json(applicationDetail);
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ message: 'Failed to fetch application details', error: error.message });
  }
};

// Get company applications (for company dashboard)
const getCompanyApplications = async (req, res) => {
  try {
    const company = await companyModel.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const { internshipId, status, sortBy = 'matchScore', page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { companyId: company._id };
    if (internshipId) query.internshipId = internshipId;
    if (status) query.status = status;

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'matchScore':
        sortCriteria = { 'matchScore.total': -1 };
        break;
      case 'appliedAt':
        sortCriteria = { appliedAt: -1 };
        break;
      case 'name':
        sortCriteria = { 'student.name': 1 };
        break;
      default:
        sortCriteria = { 'matchScore.total': -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await applicationModel
      .find(query)
      .populate('internshipId', 'title domain location workMode salary')
      .populate('studentId', 'firstname lastname university graduationYear')
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await applicationModel.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching company applications:', error);
    res.status(500).json({ 
      message: 'Failed to fetch applications',
      error: error.message 
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Verify company ownership if company is updating
    if (req.user.role === 'company') {
      const company = await companyModel.findOne({ userId: req.user.userId });
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      
      // Find application and check if it belongs to this company
      const application = await applicationModel.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      if (application.companyId.toString() !== company._id.toString()) {
        return res.status(403).json({ message: 'Access denied: This application does not belong to your company' });
      }
    }
    
    // Admin can update any application
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      // If status is being changed to "reviewed" or beyond, set reviewedAt
      if (['reviewed', 'shortlisted', 'rejected', 'accepted'].includes(status)) {
        updateData.reviewedAt = new Date();
      }
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    const updatedApplication = await applicationModel.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('internshipId').populate('studentId');
    
    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.status(200).json({
      message: 'Application status updated successfully',
      application: updatedApplication
    });
    
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status', error: error.message });
  }
};

export { 
  getStudentApplications,
  getApplicationById,
  getCompanyApplications,
  updateApplicationStatus
};
