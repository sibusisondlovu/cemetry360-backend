const mongoose = require('mongoose');

const ownershipSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true,
  },
  plotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    required: true,
  },
  rightIssueDate: {
    type: Date,
    required: true,
  },
  validityPeriod: {
    type: Number,
  },
  validityUnit: {
    type: String,
    enum: ['Years', 'Perpetual'],
    default: 'Perpetual',
  },
  expiryDate: {
    type: Date,
  },
  conditions: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDisputed: {
    type: Boolean,
    default: false,
  },
  disputeNotes: {
    type: String,
  },
  transferredFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ownership',
  },
  transferDate: {
    type: Date,
  },
  transferReason: {
    type: String,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ownership', ownershipSchema);
