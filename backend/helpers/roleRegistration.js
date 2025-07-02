import studentModel from '../models/studentModel.js';
import mentorModel from '../models/mentorModel.js';
import companyModel from '../models/companyModel.js';

const registerByRole = async (role, userId, extra) => {
  if (role === 'student') {
    return await studentModel.create({
      userId,
      firstname: extra.firstname || '',
      lastname: extra.lastname || '',
      university: extra.university || '',
      graduationYear: extra.graduationYear || '',
      education: extra.education || '',
      skills: extra.skills || [],
      resumeUrl: extra.resumeUrl || '',
      appliedInternships: extra.appliedInternships || [],
      mockInterviewsTaken: extra.mockInterviewsTaken || [],
      mentorRequests: extra.mentorRequests || [],
    });
  } else if (role === 'mentor') {
    return await mentorModel.create({
      userId,
      firstname: extra.firstname || '',
      lastname: extra.lastname || '',
      expertise: extra.expertise || [],
      availability: extra.availability || [],
      sessions: [],
    });
  } else if (role === 'company') {
    return await companyModel.create({
      userId,
      companyName: extra.companyName,
      description: extra.description,
      website: extra.website || '',
      verified: false,
      internships: [],
      pdfUrl: extra.pdfUrl, // From Cloudinary
      pdfPublicId: extra.pdfPublicId, // From Cloudinary
    });
  }
};

export { registerByRole };
