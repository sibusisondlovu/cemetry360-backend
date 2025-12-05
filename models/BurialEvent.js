const mongoose = require('mongoose');

const burialEventSchema = new mongoose.Schema({
  deceasedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deceased',
    required: true,
  },
  plotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
  },
  crematoriumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crematorium',
  },
  burialDate: {
    type: Date,
    required: true,
  },
  burialTime: {
    type: String,
  },
  serviceType: {
    type: String,
    enum: ['Burial', 'Cremation'],
    required: true,
  },
  funeralType: {
    type: String,
    enum: ['Pauper', 'Private', 'Municipal'],
    required: true,
  },
  officiatingOfficer: {
    type: String,
  },
  undertakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Undertaker',
  },
  undertakerName: {
    type: String,
  },
  crematorium: {
    type: String,
  },
  urnStorageLocation: {
    type: String,
  },
  scatteringLocation: {
    type: String,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  confirmedAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('BurialEvent', burialEventSchema);
