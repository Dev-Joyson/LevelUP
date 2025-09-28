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
    
    // Mock Interview Reports - stores complete interview summary and PDF links
    mockInterviewReports: [{
        sessionId: {
            type: String,
            required: true
        },
        mockInterviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'mockInterview',
            required: true
        },
        interviewTitle: String,
        interviewDomain: String,
        difficulty: String,
        completedAt: {
            type: Date,
            required: true
        },
        duration: Number, // in minutes
        
        // Summary Report Data
        summaryReport: {
            overallScore: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            },
            categoryScores: {
                technical: { type: Number, default: 0 },
                communication: { type: Number, default: 0 },
                problemSolving: { type: Number, default: 0 }
            },
            strengths: [String],
            weaknesses: [String],
            improvementSuggestions: [String],
            summary: String,
            recommendation: {
                type: String,
                enum: ['Excellent', 'Good', 'Average', 'Needs Improvement', 'Poor']
            },
            questionsAttempted: Number,
            totalQuestions: Number,
            totalTimeSpent: Number // in seconds
        },
        
        // Cloudinary PDF Report
        pdfReport: {
            cloudinaryUrl: String,
            publicId: String,
            uploadedAt: Date
        }
    }],
    
    mentorRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'mentor'}],
    sessions: [{type: mongoose.Schema.Types.ObjectId, ref: 'session'}],
    university: { type: String, required: true },
    graduationYear: { type: String, required: true },
    profileImageUrl: { type: String, default: '' },
    profileImagePublicId: { type: String, default: '' },
})

const studentModel = mongoose.models.student || mongoose.model('student', studentSchema)
export default studentModel