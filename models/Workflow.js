const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['Booking', 'Exhumation', 'WorkOrder', 'OwnershipTransfer'],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  currentState: {
    type: String,
    required: true,
  },
  previousState: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  workflowSteps: [{
    stepName: {
      type: String,
      required: true,
    },
    stepOrder: {
      type: Number,
      required: true,
    },
    requiredRole: {
      type: String, // Role that can perform this step
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'approved', 'rejected', 'skipped'],
      default: 'pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    comments: {
      type: String,
    },
    required: {
      type: Boolean,
      default: true,
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completedAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
workflowSchema.index({ entityType: 1, entityId: 1 });
workflowSchema.index({ status: 1, currentState: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);

