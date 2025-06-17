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
}, { timestamps: true });

const companyModel = mongoose.models.company || mongoose.model('company', companySchema);
export default companyModel;