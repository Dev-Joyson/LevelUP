import internshipModel from '../models/internshipModel.js';

const companyDashboard = (req, res) => {
    res.json({ message: "Welcome to the Company Dashboard", user: req.user });
  };
  
// Create a new internship
const createInternship = async (req, res) => {
  try {
    const companyId = req.user.userId;
    const { title, description, domain, duration, location, criteria, salary, workMode } = req.body;
    if (!title || !description || !domain || !duration || !location || !criteria || !workMode || !salary || typeof salary !== 'object' || salary.min == null || salary.max == null) {
      return res.status(400).json({ message: 'All fields are required, including salary range (min and max)' });
    }
    if (typeof salary.min !== 'number' || typeof salary.max !== 'number' || salary.min < 0 || salary.max < salary.min) {
      return res.status(400).json({ message: 'Salary min and max must be valid numbers and max >= min' });
    }
    const internship = await internshipModel.create({
      companyId,
      title,
      description,
      domain,
      duration,
      location,
      criteria,
      salary: { min: salary.min, max: salary.max },
      workMode,
    });
    res.status(201).json({ message: 'Internship created successfully', internship });
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ message: 'Failed to create internship' });
  }
};

export { companyDashboard, createInternship };
  