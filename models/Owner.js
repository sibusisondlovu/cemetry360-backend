const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  idNumber: {
    type: String,
  },
  contactAddress: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  ownershipType: {
    type: String,
    enum: ['Individual', 'Family', 'Organization'],
    default: 'Individual',
  },
  nextOfKin: {
    type: String,
  },
  nextOfKinContact: {
    type: String,
  },
  alternateContact: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Owner', ownerSchema);
