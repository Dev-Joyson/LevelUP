import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:'user', required: true},
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    education: String,
    skills: [String],
    phoneNumber: String,
    resumeUrl: String,
    resumePublicId: String,
    appliedInternships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'internship'}],
    mockInterviewsTaken: [String],
    mentorRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'mentor'}],
    sessions: [{type: mongoose.Schema.Types.ObjectId, ref: 'session'}],
    university: { type: String, required: true },
    graduationYear: { type: String, required: true },
    profileImageUrl: { type: String, default: '' },
    profileImagePublicId: { type: String, default: '' },
})

const studentModel = mongoose.models.student || mongoose.model('student', studentSchema)
export default studentModel