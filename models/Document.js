const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  documentType: {
    type: String,
    enum: ['Death Certificate', 'Burial Order', 'ID Copy', 'Allocation Letter', 'Transfer Document', 'Exhumation Permit', 'Monument Approval', 'Other'],
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
