import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { validateFields } from '../helpers/validateFields.js';
import { registerByRole } from '../helpers/roleRegistration.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

const register = async (req, res) => {
  try {
    const { email, password, role, extra } = req.body;

    // Validating Email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Checking existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Role-specific field validation (pass req for file check)
    const validationError = validateFields(role, extra, req);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      email,
      password: hashedPassword,
      role,
    });
    const savedUser = await newUser.save();

    // Handle PDF upload for company role
    let pdfUrl = '';
    let pdfPublicId = '';
    if (role === 'company' && req.file) {
      const { url, publicId } = await uploadToCloudinary(req.file, savedUser._id, extra.companyName);
      pdfUrl = url;
      pdfPublicId = publicId;
    }

    // Role-based registration with PDF metadata
    await registerByRole(role, savedUser._id, { ...extra, pdfUrl, pdfPublicId });

    res.status(201).json({
      message: `User registered successfully as ${role}`,
      userId: savedUser._id,
    });

  } catch (error) {

    console.error('Registration error:', error);
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Something went wrong during registration' });
    
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
      { expiresIn: "1d" }
    )

    // Mentor approval check
    if (user.role === 'mentor') {
      const mentor = await (await import('../models/mentorModel.js')).default.findOne({ userId: user._id });
      if (mentor && !mentor.verified) {
        return res.status(403).json({ message: "Your account is pending admin approval." });
      }
    }

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
