const mongoose = require('mongoose');

const crematoriumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  cemeteryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cemetery',
    required: true,
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
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  capacity: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Maintenance'],
    default: 'Active',
  },
  operatingHours: {
    type: String,
  },
  contactPhone: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

crematoriumSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Crematorium', crematoriumSchema);

