const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  cemeteryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cemetery',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  block: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Active', 'Full', 'Closed'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Section', sectionSchema);
