import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'student', required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'internship', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true },
  
  // Student basic info (embedded for quick access)
  student: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    university: { type: String },
    graduationYear: { type: String }
  },
  
  // Parsed resume data
  resumeData: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    university: { type: String },
    degree: { type: String },
    skills: {
      programmingLanguages: [String],
      frameworks: [String],
      tools: [String],
      cloudPlatforms: [String],
      databases: [String],
      other: [String]
    },
    experience: [{
      company: { type: String },
      role: { type: String },
      duration: { type: String },
      description: { type: String }
    }],
    projects: [{
      name: { type: String },
      description: { type: String },
      technologies: [String],
      url: { type: String }
    }],
    gpa: { type: Number },
    certifications: [String]
  },
  
  // Match scoring with detailed breakdown
  matchScore: {
    total: { type: Number, default: 0 }, // Overall score out of 100
    breakdown: {
      skills: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      gpa: { type: Number, default: 0 },
      certifications: { type: Number, default: 0 }
    },
    details: {
      skillsMatched: [String], // Which skills matched
      projectsCount: { type: Number, default: 0 },
      experienceCount: { type: Number, default: 0 },
      gpaValue: { type: Number },
      certificationsCount: { type: Number, default: 0 }
    }
  },
  
  // Application status
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'], 
    default: 'pending' 
  },
  
  // Additional fields
  coverLetter: { type: String },
  resumeUrl: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  notes: { type: String } // Company notes about the candidate
}, {
  timestamps: true
});

// Indexes for efficient querying
applicationSchema.index({ internshipId: 1, 'matchScore.total': -1 });
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ studentId: 1, appliedAt: -1 });

const applicationModel = mongoose.models.application || mongoose.model('application', applicationSchema);
export default applicationModel;
