import internshipModel from '../models/internshipModel.js';
import companyModel from '../models/companyModel.js';

const companyDashboard = (req, res) => {
    res.json({ message: "Welcome to the Company Dashboard", user: req.user });
  };
  
// Create a new internship
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

export { companyDashboard, createInternship };
  