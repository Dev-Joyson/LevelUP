import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  companyName: { type: String, required: true },
  description: { type: String, required: true },
  website: String,
  verified: { type: Boolean, default: false },
  internships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'internship' }],
  pdfUrl: { type: String, required: true }, 
  pdfPublicId: { type: String, required: true },
  appliedStudents: { type: Number, default: 0 },
  industry: { type: String },
  location: { type: String },
  foundedYear: { type: String },
  employees: { type: String },
  logoUrl: { type: String },
  logoPublicId: { type: String },
  reviews: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'student', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'application', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'internship', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual field for user email
companySchema.virtual('userEmail', {
  ref: 'user',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const companyModel = mongoose.models.company || mongoose.model('company', companySchema);
export default companyModel;