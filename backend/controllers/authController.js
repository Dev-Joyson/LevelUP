import userModel from '../models/userModel.js';
import otpModel from '../models/otpModel.js';
import companyModel from '../models/companyModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';
import { validateFields } from '../helpers/validateFields.js';
import { registerByRole } from '../helpers/roleRegistration.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { sendEmail } from '../utils/emailService.js';

// HELPER FUNCTION: Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// HELPER FUNCTION: Hash OTP for secure storage
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

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

    // Create user with email unverified
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      email,
      password: hashedPassword,
      role,
      emailVerified: false, // Email starts as unverified
      isVerified: role === 'student', // Only students are auto-approved, mentors & companies need admin approval
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

    // Generate and send OTP for email verification
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);
    
    // Save OTP to database
    await otpModel.create({
      email: email.toLowerCase(),
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - LevelUP Registration',
      html: generateOTPEmailTemplate(otp, role)
    });

    res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
      userId: savedUser._id,
      emailSent: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
};


// HELPER FUNCTION: Generate OTP Email Template
const generateOTPEmailTemplate = (otp, role) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #535c91; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .otp-box { background: #f8f9ff; border: 2px solid #535c91; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #535c91; letter-spacing: 8px; margin: 10px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Level<span style="color: #007bff;">UP</span></div>
                <h2>Email Verification Required</h2>
            </div>
            
            <p>Welcome to LevelUP! You're almost ready to start your journey as a <strong>${role}</strong>.</p>
            
            <p>Please verify your email address by entering the verification code below:</p>
            
            <div class="otp-box">
                <p style="margin: 0; color: #535c91; font-weight: bold;">Your Verification Code:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 14px;">This code expires in 5 minutes</p>
            </div>
            
            <p>If you didn't create a LevelUP account, please ignore this email.</p>
            
            <div class="footer">
                <p>Best regards,<br/>The LevelUP Team</p>
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// SEND OTP FUNCTION
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if user exists and is unverified
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Rate limiting: Check recent OTP requests
    const recentOTP = await otpModel.findOne({ 
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) } // Within last 2 minutes
    });
    
    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait before requesting a new OTP. Try again in 2 minutes.' 
      });
    }
    
    // Delete any existing OTPs for this email
    await otpModel.deleteMany({ email: email.toLowerCase() });
    
    // Generate new OTP
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);
    
    // Save new OTP
    await otpModel.create({
      email: email.toLowerCase(),
      otp: hashedOtp,
    });
    
    // Send email
    await sendEmail({
      to: email,
      subject: 'New Verification Code - LevelUP',
      html: generateOTPEmailTemplate(otp, user.role)
    });
    
    res.status(200).json({
      message: 'New verification code sent to your email',
      emailSent: true
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
};

// VERIFY OTP FUNCTION
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ message: 'Please enter a valid 6-digit code' });
    }
    
    // Find user
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Find OTP record
    const otpRecord = await otpModel.findOne({ email: email.toLowerCase() });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Verification code expired or not found' });
    }
    
    // Check attempts
    if (otpRecord.attempts >= 3) {
      await otpModel.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        message: 'Too many failed attempts. Please request a new verification code.' 
      });
    }
    
    // Verify OTP
    const hashedInputOtp = hashOTP(otp);
    if (hashedInputOtp !== otpRecord.otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      const attemptsLeft = 3 - otpRecord.attempts;
      return res.status(400).json({ 
        message: `Invalid verification code. ${attemptsLeft} attempts remaining.` 
      });
    }
    
    // SUCCESS: Verify the user's email
    user.emailVerified = true;
    await user.save();
    
    // Clean up OTP
    await otpModel.deleteMany({ email: email.toLowerCase() });
    
    res.status(200).json({
      message: 'Email verified successfully! You can now log in.',
      verified: true
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify code' });
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

    // EMAIL VERIFICATION CHECK (all users must verify email)
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email address before logging in.",
        emailNotVerified: true 
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    // ADMIN APPROVAL CHECK (mentors and companies)
    if (user.role === 'mentor' && !user.isVerified) {
      return res.status(403).json({ 
        message: "Your account is pending admin approval.",
        adminApprovalPending: true 
      });
    }

    // COMPANY VERIFICATION CHECK (using company.verified field)
    if (user.role === 'company') {
      const company = await companyModel.findOne({ userId: user._id });
      if (!company || !company.verified) {
        return res.status(403).json({ 
          message: "Your account is pending admin approval.",
          adminApprovalPending: true 
        });
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

// Get current user data (for profile)
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
};

export { register, login, getCurrentUser, sendOTP, verifyOTP };