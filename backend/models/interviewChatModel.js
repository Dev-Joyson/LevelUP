import mongoose from "mongoose";

const interviewChatSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        ref: 'interviewSession',
        required: true
    },
    messageType: {
        type: String,
        enum: ['ai_question', 'student_answer', 'ai_feedback', 'system_message', 'ai_greeting', 'ai_summary'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    questionNumber: {
        type: Number // Which question this message relates to
    },
    metadata: {
        // For AI messages
        model: String,
        tokens: Number,
        responseTime: Number, // in milliseconds
        
        // For student messages
        wordCount: Number,
        typingTime: Number, // time spent typing in milliseconds
        
        // For system messages
        eventType: String
    },
    
    // Message status
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    
    // For AI evaluation messages
    evaluation: {
        score: Number,
        feedback: String,
        strengths: [String],
        improvements: [String]
    },
    
    // Timing information
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: false // Using custom timestamp field
});

// Indexes for efficient querying
interviewChatSchema.index({ sessionId: 1, timestamp: 1 });
interviewChatSchema.index({ sessionId: 1, questionNumber: 1 });
interviewChatSchema.index({ messageType: 1 });

// Method to mark message as read
interviewChatSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Static method to get chat history for session
interviewChatSchema.statics.getChatHistory = function(sessionId, limit = 50) {
    return this.find({ sessionId })
        .sort({ timestamp: 1 })
        .limit(limit)
        .exec();
};

// Static method to get messages by question
interviewChatSchema.statics.getMessagesByQuestion = function(sessionId, questionNumber) {
    return this.find({ sessionId, questionNumber })
        .sort({ timestamp: 1 })
        .exec();
};

const interviewChatModel = mongoose.models.interviewChat || mongoose.model('interviewChat', interviewChatSchema);
export default interviewChatModel;

