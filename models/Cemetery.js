const mongoose = require('mongoose');

const cemeterySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  gpsLatitude: {
    type: Number,
  },
  gpsLongitude: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Open', 'Full', 'Closed'],
    default: 'Open',
  },
  type: {
    type: String,
    enum: ['Burial', 'Cremation', 'Mixed'],
    default: 'Mixed',
  },
  region: {
    type: String,
  },
  zone: {
    type: String,
  },
  ward: {
    type: String,
  },
  contactPhone: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  openingHours: {
    type: String,
  },
  operationalRules: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Cemetery', cemeterySchema);
