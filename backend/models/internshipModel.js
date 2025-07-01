import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true },

  // Embedded company details for quick access
  company: {
    name: { type: String }
  },

  title: { type: String, required: true },
  description: { type: String, required: true },
  aboutRole: { type: String },

  domain: { type: String },
  duration: { type: String },
  location: { type: String, required: true },

  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    display: { type: String } // e.g., "30,000 LKR - 50,0000 LKR"
  },

  workMode: { type: String, enum: ['remote', 'onsite', 'hybrid'], required: true },

  criteria: {
    skills: [String],
    education: { type: String }
  },

  // Enhanced matching criteria with validation
  matchingCriteria: {
    skills: { 
      type: Number, 
      default: 40,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 100;
        },
        message: 'Skills percentage must be between 0 and 100'
      }
    },
    projects: { 
      type: Number, 
      default: 30,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 100;
        },
        message: 'Projects percentage must be between 0 and 100'
      }
    },
    experience: { 
      type: Number, 
      default: 20,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 100;
        },
        message: 'Experience percentage must be between 0 and 100'
      }
    },
    gpa: { 
      type: Number, 
      default: 5,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 100;
        },
        message: 'GPA percentage must be between 0 and 100'
      }
    },
    certifications: { 
      type: Number, 
      default: 5,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 100;
        },
        message: 'Certifications percentage must be between 0 and 100'
      }
    }
  },

  // Specific requirements for better matching
  requirements: [String], // List of requirements
  
  // Preferred skills for better matching
  preferredSkills: [String],
  
  // Minimum GPA requirement
  minimumGPA: { type: Number, default: 0 },

  // Benefits split into array of strings for easier display
  benefits: [String],

  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'student' }],

  // Status flags for workflow and filtering
  isPublished: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },

  // Application deadline
  applicationDeadline: { type: Date },
  
  // Number of positions available
  positions: { type: Number, default: 1 },

  createdAt: { type: Date, default: Date.now }
});

const internshipModel = mongoose.models.internship || mongoose.model('internship', internshipSchema);
export default internshipModel;













// import mongoose from "mongoose";

// const internshipSchema = new mongoose.Schema({
//     companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true },
//     title: String,
//     description: String,
//     domain: String,
//     duration: String,
//     location: String,
//     salary: {
//       min: { type: Number, required: true },
//       max: { type: Number, required: true }
//     },
//     workMode: { type: String, enum: ['remote', 'onsite', 'hybrid'], required: true },
//     criteria: {
//       skills: [String],
//       education: String
//     },
//     applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'student' }],
//     createdAt: { type: Date, default: Date.now }
// })

// const internshipModel = mongoose.models.internship || mongoose.model('internship', internshipSchema)
// export default internshipModel