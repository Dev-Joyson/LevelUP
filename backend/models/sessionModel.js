import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    sessionId: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'student', 
        required: true 
    },
    mentorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'mentor', 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    startTime: { 
        type: String, 
        required: true 
    },
    endTime: { 
        type: String, 
        required: true 
    },
    sessionTypeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    sessionTypeName: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['confirmed', 'completed', 'cancelled'], 
        default: 'confirmed' 
    }
}, { timestamps: true });

const sessionModel = mongoose.models.session || mongoose.model('session', sessionSchema);
export default sessionModel;
