import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true },
    title: String,
    description: String,
    domain: String,
    duration: String,
    location: String,
    criteria: {
      skills: [String],
      education: String
    },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'student' }],
    createdAt: { type: Date, default: Date.now }
})

const internshipModel = mongoose.models.internship || mongoose.model('internship', internshipSchema)
export default internshipModel