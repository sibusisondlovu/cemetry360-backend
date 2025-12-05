const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  referenceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  complainantName: {
    type: String,
    required: true,
  },
  complainantContact: {
    type: String,
  },
  complainantEmail: {
    type: String,
  },
  cemeteryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cemetery',
  },
  plotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
  },
  category: {
    type: String,
    enum: ['Overgrown Grave', 'Missing Headstone', 'Incorrect Details', 'Access Issues', 'Other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  workOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
  },
  resolvedDate: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolutionNotes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Enquiry', enquirySchema);
