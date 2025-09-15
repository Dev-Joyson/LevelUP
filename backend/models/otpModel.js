import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        lowercase: true 
    },
    otp: { 
        type: String, 
        required: true 
    },
    expiresAt: { 
        type: Date, 
        required: true,
        default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        index: { expires: 0 } // MongoDB will automatically delete expired documents
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3 // Maximum 3 attempts per OTP
    }
}, { 
    timestamps: true 
});

// Index for faster queries
otpSchema.index({ email: 1 });
// Note: expiresAt already has TTL index from field definition

const otpModel = mongoose.models.otp || mongoose.model('otp', otpSchema);

export default otpModel;
