import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'student', required: true },
  resumeUrl: { type: String, required: true },
  parsedData: { type: Object, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const resumeModel = mongoose.models.resume || mongoose.model('resume', resumeSchema);
export default resumeModel; 

