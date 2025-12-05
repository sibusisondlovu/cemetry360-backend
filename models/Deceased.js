const mongoose = require('mongoose');

const deceasedSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  alias: {
    type: String,
  },
  sex: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  dateOfBirth: {
    type: Date,
  },
  dateOfDeath: {
    type: Date,
    required: true,
  },
  idNumber: {
    type: String,
  },
  passportNumber: {
    type: String,
  },
  nationality: {
    type: String,
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Unknown'],
  },
  causeOfDeath: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Deceased', deceasedSchema);
