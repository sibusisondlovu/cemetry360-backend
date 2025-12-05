const mongoose = require('mongoose');

const tariffSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    enum: ['Grave Purchase', 'Burial Fee', 'Cremation Fee', 'Exhumation', 'Memorial Permit', 'Re-interment', 'Other'],
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  customerCategory: {
    type: String,
    enum: ['Resident', 'Non-Resident', 'Indigent'],
    default: 'Resident',
  },
  effectiveDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Tariff', tariffSchema);
