const mentorDashboard = (req, res) => {
    res.json({ message: "Welcome to the Mentor Dashboard", user: req.user });
  };
  
  export { mentorDashboard };
  