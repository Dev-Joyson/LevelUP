import companyModel from '../models/companyModel.js';

export const checkCompanyVerification = async (req, res, next) => {
  try {
    // Only check for company role
    if (req.user.role !== 'company') {
      return next();
    }

    const company = await companyModel.findOne({ userId: req.user.userId });
    
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    if (!company.verified) {
      return res.status(403).json({ 
        message: 'Your company account is pending verification. You will be notified once approved.',
        isVerified: false
      });
    }

    // Add company data to request for use in routes
    req.company = company;
    next();
  } catch (error) {
    console.error('Company verification check error:', error);
    res.status(500).json({ message: 'Error checking company verification status' });
  }
}; 