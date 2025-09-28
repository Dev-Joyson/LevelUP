import mongoose from "mongoose";

const mockInterviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    domain: {
        type: String,
        required: true,
        enum: ['Web Development', 'Data Structures & Algorithms', 'System Design', 'Machine Learning', 'Mobile Development', 'DevOps', 'Database Design', 'Other'],
        trim: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard']
    },
    numberOfQuestions: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    duration: {
        type: Number, // Duration in minutes
        required: true,
        min: 5,
        max: 180
    },
    isActive: {
        type: Boolean,
        default: false // Only admins can activate after review
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false, // Optional - null for admin-created interviews
        default: null
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    tags: [String], // Additional tags for filtering
    estimatedScore: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 }
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
});

// Indexes for efficient querying
mockInterviewSchema.index({ domain: 1, difficulty: 1 });
mockInterviewSchema.index({ isActive: 1, isPublished: 1 });
mockInterviewSchema.index({ createdBy: 1 });

// Virtual for getting questions count
mockInterviewSchema.virtual('questionsCount', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'mockInterviewId',
    count: true
});

// Method to check if interview can be started
mockInterviewSchema.methods.canStartInterview = function() {
    return this.isActive && this.isPublished;
};

const mockInterviewModel = mongoose.models.mockInterview || mongoose.model('mockInterview', mockInterviewSchema);
export default mockInterviewModel;
