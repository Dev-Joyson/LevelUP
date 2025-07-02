import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  firstname: { type: String, default: '' },
  lastname: { type: String, default: '' },
  expertise: [String],
  availability: [String],
  sessions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'student' },
    date: Date,
    notes: String
  }]
}, { timestamps:true })

const mentorModel = mongoose.models.mentor || mongoose.model('mentor', mentorSchema)
export default mentorModel
