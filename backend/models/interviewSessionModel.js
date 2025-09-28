import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        default: () => `interview_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    mockInterviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mockInterview',
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'in_progress', 'completed', 'terminated', 'timeout'],
        default: 'waiting'
    },
    startedAt: Date,
    endedAt: Date,
    lastActivity: {
        type: Date,
        default: Date.now
    },
    currentQuestionNumber: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    timeRemaining: {
        type: Number, // in seconds
        default: 0
    },
    
    // Answers and AI feedback for each question
    answers: [{
        questionNumber: {
            type: Number,
            required: true
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'question',
            required: true
        },
        studentAnswer: {
            type: String,
            trim: true
        },
        answerTime: Date,
        aiEvaluation: {
            score: {
                type: Number,
                min: 0,
                max: 100
            },
            feedback: String,
            strengths: [String],
            improvements: [String],
            keyPointsCovered: [String],
            evaluatedAt: Date,
            model: String // GPT model used
        },
        timeSpent: Number // seconds spent on this question
    }],
    
    // Final AI-generated report
    finalReport: {
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
        generatedAt: Date,
        pdfPath: String // Path to generated PDF report
    },
    
    // Metadata
    totalTimeSpent: {
        type: Number,
        default: 0 // in seconds
    },
    connectionLogs: [{
        event: {
            type: String,
            enum: ['connected', 'disconnected', 'reconnected']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],
    
    // Performance metrics
    averageResponseTime: Number,
    questionsAttempted: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
});

// Indexes for efficient querying
interviewSessionSchema.index({ studentId: 1, createdAt: -1 });
interviewSessionSchema.index({ mockInterviewId: 1, status: 1 });
interviewSessionSchema.index({ status: 1, startedAt: 1 });

// Method to start interview
interviewSessionSchema.methods.startInterview = function() {
    this.status = 'in_progress';
    this.startedAt = new Date();
    this.currentQuestionNumber = 1;
    return this.save();
};

// Method to move to next question
interviewSessionSchema.methods.nextQuestion = function() {
    if (this.currentQuestionNumber < this.totalQuestions) {
        this.currentQuestionNumber++;
    }
    return this.save();
};

// Method to complete interview
interviewSessionSchema.methods.completeInterview = function() {
    this.status = 'completed';
    this.endedAt = new Date();
    this.totalTimeSpent = Math.floor((this.endedAt - this.startedAt) / 1000);
    return this.save();
};

// Method to add answer with AI evaluation
interviewSessionSchema.methods.addAnswer = function(questionNumber, questionId, answer, evaluation) {
    const answerEntry = {
        questionNumber,
        questionId,
        studentAnswer: answer,
        answerTime: new Date(),
        aiEvaluation: evaluation
    };
    
    this.answers.push(answerEntry);
    this.questionsAttempted = this.answers.length;
    
    return this.save();
};

// Virtual to check if interview is active
interviewSessionSchema.virtual('isActive').get(function() {
    return ['waiting', 'in_progress'].includes(this.status);
});

const interviewSessionModel = mongoose.models.interviewSession || mongoose.model('interviewSession', interviewSessionSchema);
export default interviewSessionModel;

