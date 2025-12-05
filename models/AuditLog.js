const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  operation: {
    type: String,
    enum: ['Create', 'Update', 'Delete'],
    required: true,
  },
  beforeValue: {
    type: String,
  },
  afterValue: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
