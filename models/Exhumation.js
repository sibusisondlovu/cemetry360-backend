const mongoose = require('mongoose');

const exhumationSchema = new mongoose.Schema({
  plotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    required: true,
  },
  deceasedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deceased',
    required: true,
  },
  applicationDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending',
  },
  exhumationDate: {
    type: Date,
  },
  exhumationTime: {
    type: String,
  },
  witnesses: {
    type: String,
  },
  officials: {
    type: String,
  },
  newBurialLocation: {
    type: String,
  },
  newPlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
  },
  healthOfficerApproval: {
    type: Boolean,
    default: false,
  },
  cemeteryManagerApproval: {
    type: Boolean,
    default: false,
  },
  legalApproval: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Exhumation', exhumationSchema);
