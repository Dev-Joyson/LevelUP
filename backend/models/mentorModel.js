import mongoose from "mongoose";

const sessionTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: Number, required: true }, // Duration in minutes
  price: { type: Number, default: 0 }, // 0 means free
  isActive: { type: Boolean, default: true }
}, { _id: true });

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  firstname: { type: String, default: '' },
  lastname: { type: String, default: '' },
  expertise: [String],
  availability: [String],
  sessionTypes: {
    type: [sessionTypeSchema],
    default: [
      {
        name: 'Free Introduction',
        description: 'A short 15-minute session to get to know each other and discuss potential mentorship',
        duration: 15,
        price: 0,
        isActive: true
      },
      {
        name: 'Expert Session',
        description: 'A comprehensive 60-minute session focused on specific topics or challenges',
        duration: 60,
        price: 2000, // LKR 2000
        isActive: true
      }
    ]
  },
  sessions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'student' },
    date: Date,
    notes: String,
    sessionTypeId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' }
  }]
}, { timestamps:true })

const mentorModel = mongoose.models.mentor || mongoose.model('mentor', mentorSchema)
export default mentorModel
