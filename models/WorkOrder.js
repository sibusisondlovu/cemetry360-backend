const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  cemeteryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cemetery',
    required: true,
  },
  plotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  },
  taskType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  requestedDate: {
    type: Date,
    required: true,
  },
  assignedTo: {
    type: String,
  },
  assignedTeam: {
    type: String,
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'On Hold', 'Completed'],
    default: 'New',
  },
  completedDate: {
    type: Date,
  },
  completedBy: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
