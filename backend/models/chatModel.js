import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'session', 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  senderRole: { 
    type: String, 
    enum: ['student', 'mentor'], 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    trim: true 
  },
  messageType: { 
    type: String, 
    enum: ['text', 'system'], 
    default: 'text' 
  },
  readBy: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user' 
    },
    readAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  editedAt: Date,
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: Date
}, { 
  timestamps: true 
});

// Index for efficient querying
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });

// Virtual for checking if message is read by specific user
chatMessageSchema.virtual('isReadBy').get(function() {
  return (userId) => this.readBy.some(read => read.userId.toString() === userId.toString());
});

// Method to mark message as read by user
chatMessageSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.some(read => read.userId.toString() === userId.toString())) {
    this.readBy.push({ userId, readAt: new Date() });
  }
  return this.save();
};

const chatModel = mongoose.models.chatMessage || mongoose.model('chatMessage', chatMessageSchema);
export default chatModel;
