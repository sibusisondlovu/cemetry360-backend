const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  plotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
  },
  crematoriumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crematorium',
  },
  deceasedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deceased',
    required: true,
  },
  cemeteryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cemetery',
    required: true,
  },
  requestedDate: {
    type: Date,
    required: true,
  },
  requestedTime: {
    type: String,
    required: true,
  },
  serviceDuration: {
    type: Number,
    default: 60,
  },
  bufferMinutes: {
    type: Number,
    default: 30,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Expired'],
    default: 'Pending',
  },
  requestedBy: {
    type: String,
  },
  undertakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Undertaker',
  },
  undertakerName: {
    type: String,
  },
  isProvisional: {
    type: Boolean,
    default: false,
  },
  provisionalExpiry: {
    type: Date,
  },
  confirmationNumber: {
    type: String,
    unique: true,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
