const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'booking_pending_approval',
      'booking_approved',
      'booking_rejected',
      'exhumation_pending_approval',
      'exhumation_approved',
      'exhumation_rejected',
      'work_order_assigned',
      'work_order_completed',
      'document_expiring',
      'document_expired',
      'system_alert',
      'workflow_action_required',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedEntityType: {
    type: String,
    enum: ['Booking', 'Exhumation', 'WorkOrder', 'Undertaker', 'User'],
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  actionUrl: {
    type: String, // URL to navigate to for action
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Additional data
  },
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

