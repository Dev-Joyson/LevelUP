import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    mockInterviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mockInterview',
        required: true
    },
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    questionNumber: {
        type: Number,
        required: true,
        min: 1
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard']
    },
    expectedAnswer: {
        type: String,
        trim: true
    },
    keyPoints: [String], // Key points that should be covered in the answer
    category: {
        type: String,
        enum: ['Technical', 'Behavioral', 'Problem Solving', 'System Design', 'Coding'],
        default: 'Technical'
    },
    estimatedTime: {
        type: Number, // Time in minutes
        default: 5
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false, // Optional - null for admin approvals
        default: null
    },
    approvedAt: Date,
    generatedPrompt: String, // The prompt used to generate this question
    aiMetadata: {
        model: String,
        generatedAt: Date,
        tokens: Number
    }
}, { 
    timestamps: true 
});

// Compound index to ensure unique question numbers per interview
questionSchema.index({ mockInterviewId: 1, questionNumber: 1 }, { unique: true });
questionSchema.index({ mockInterviewId: 1, isApproved: 1 });
questionSchema.index({ difficulty: 1, category: 1 });

// Method to approve question
questionSchema.methods.approve = function(adminId) {
    this.isApproved = true;
    this.approvedBy = adminId;
    this.approvedAt = new Date();
    return this.save();
};

const questionModel = mongoose.models.question || mongoose.model('question', questionSchema);
export default questionModel;
