const companyDashboard = (req, res) => {
    res.json({ message: "Welcome to the Company Dashboard", user: req.user });
  };
  
  export { companyDashboard };
  