const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  uniqueIdentifier: {
    type: String,
    required: true,
    unique: true,
  },
  row: {
    type: String,
  },
  plotNumber: {
    type: String,
    required: true,
  },
  graveType: {
    type: String,
    enum: ['Single', 'Double-Depth', 'Family', 'Niche', 'Mausoleum'],
    default: 'Single',
  },
  graveSize: {
    type: String,
  },
  allowedBurials: {
    type: Number,
    default: 1,
  },
  currentBurials: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Occupied', 'Closed', 'Under Investigation', 'Under Maintenance', 'Re-usable'],
    default: 'Available',
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
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

plotSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Plot', plotSchema);
