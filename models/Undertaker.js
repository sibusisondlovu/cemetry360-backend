const mongoose = require('mongoose');

const undertakerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  certificateOfCompetence: {
    type: String,
    required: true,
  },
  dhaDesignationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  fspLicenceNumber: {
    type: String,
    required: false, // Only required if selling funeral insurance
  },
  certificateExpiryDate: {
    type: Date,
  },
  fspLicenceExpiryDate: {
    type: Date,
  },
  businessLicense: {
    type: String,
    required: true,
  },
  businessLicenseExpiryDate: {
    type: Date,
  },
  taxRegistrationNumber: {
    type: String,
    required: true,
  },
  taxRegistrationExpiryDate: {
    type: Date,
  },
  associationMembershipProof: {
    type: String, // File path or document reference
    required: true,
  },
  associationMembershipExpiryDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Undertaker', undertakerSchema);


