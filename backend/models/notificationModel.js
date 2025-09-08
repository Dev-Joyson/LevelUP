import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['company_registration', 'mentor_registration', 'application_submitted', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    enum: ['admin', 'student', 'company', 'mentor'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel',
    required: false
  },
  entityModel: {
    type: String,
    enum: ['Company', 'Mentor', 'Student', 'User', 'Application'],
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index to optimize queries for unread notifications by recipient
notificationSchema.index({ recipient: 1, isRead: 1 });

const notificationModel = mongoose.model('Notification', notificationSchema);

export default notificationModel;
