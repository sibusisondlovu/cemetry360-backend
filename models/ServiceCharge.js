const mongoose = require('mongoose');

const serviceChargeSchema = new mongoose.Schema({
  tariffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tariff',
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  burialEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BurialEvent',
  },
  amount: {
    type: Number,
    required: true,
  },
  customerCategory: {
    type: String,
    enum: ['Resident', 'Non-Resident', 'Indigent'],
    default: 'Resident',
  },
  isExempt: {
    type: Boolean,
    default: false,
  },
  exemptionReason: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Invoiced', 'Paid', 'Cancelled'],
    default: 'Pending',
  },
  invoiceNumber: {
    type: String,
  },
  paymentReference: {
    type: String,
  },
  paymentDate: {
    type: Date,
  },
  sentToBillingSystem: {
    type: Boolean,
    default: false,
  },
  sentToBillingSystemAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ServiceCharge', serviceChargeSchema);
