import jwt from 'jsonwebtoken'

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
  
export { adminDashboard, adminLogin };
  