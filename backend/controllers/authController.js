import mentorModel from "../models/mentorModel.js";
import studentModel from "../models/studentModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import companyModel from "../models/companyModel.js";
import { validateFields } from "../helpers/validateFields.js";
import { registerByRole } from "../helpers/roleRegistration.js";

const register = async (req, res) => {
  try {
    const { email, password, role, ...extra } = req.body;

    // Validating Email
    if(!validator.isEmail(email)) {
      return res.status(400).json({message: "Invalid email format"})
    }

    // Checking existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Role specific field validation
    const validationError = validateFields(role, extra)
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Create - user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      email,
      password: hashedPassword,
      role,
    }); 
    const savedUser = await newUser.save();

    
    // Role-based registration
    await registerByRole(role, savedUser._id, extra)

    res.status(201).json({
      message: `User registered successfully as ${role}`,
      userId: savedUser._id,
    });


  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong during registration" });
  }
};
//login 
const login = async (req,res) => {
  try {
    
    const {email,password} = req.body

    const user = await userModel.findOne({email})

    if(!user) {
      return res.status(400).json({message: "Invalid email or password"})
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(200).json({
      message: "Login successfull",
      token,
      role: user.role,
      userId: user._id,
    })

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
}

export { register, login};
