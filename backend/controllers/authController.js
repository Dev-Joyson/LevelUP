import mentorModel from "../models/mentorModel.js";
import studentModel from "../models/studentModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const register = async (req, res) => {
  try {
    const { email, password, role, ...extra } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();

    if (role === "student") {
      await studentModel.create({
        userId: savedUser._id,
        firstname: extra.firstname || "",
        lastname: extra.lastname || "",
        education: extra.education || "",
        skills: extra.skills || [],
        resumeUrl: extra.resumeUrl || "",
        appliedInternships: extra.appliedInternships || [],
        mockInterviewsTaken: extra.mockInterviewsTaken || [],
        mentorRequests: extra.mentorRequests || [],
      });
    } else if (role === "mentor") {
      await mentorModel.create({
        userId: newUser._id,
        expertise: extra.expertise || [],
        availability: extra.availability || [],
        sessions: [],
      });
    } else if (role === "company") {
      await companyModel.create({
        userId: newUser._id,
        companyName: extra.companyName || "",
        description: extra.description || "",
        website: extra.website || "",
        verified: false,
        internships: [],
      });
    }

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

export { register };
