const validateFields = (role, extra, req) => {
  if (role === 'student') {
    if (!extra.firstname || !extra.lastname) {
      return 'Firstname and lastname are required for students';
    }
  } else if (role === 'mentor') {
    if (!extra.expertise || extra.expertise.length === 0) {
      return 'Expertise is required for mentors';
    }
  } else if (role === 'company') {
    if (!extra.companyName || !extra.description) {
      return 'Company name and description are required';
    }
    if (!req.file) {
      return 'Registration document (PDF) is required for companies';
    }
  }
  return null; // No errors
};

export { validateFields };