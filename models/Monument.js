const mongoose = require('mongoose');

const monumentSchema = new mongoose.Schema({
  plotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    required: true,
  },
  applicationDate: {
    type: Date,
    required: true,
  },
  monumentType: {
    type: String,
    enum: ['Headstone', 'Slab', 'Monument', 'Other'],
    required: true,
  },
  dimensions: {
    type: String,
  },
  material: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Installed', 'Inspected'],
    default: 'Pending',
  },
  approvedDimensions: {
    type: String,
  },
  approvedMaterial: {
    type: String,
  },
  installationDate: {
    type: Date,
  },
  inspectionDate: {
    type: Date,
  },
  inspectionNotes: {
    type: String,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Monument', monumentSchema);
