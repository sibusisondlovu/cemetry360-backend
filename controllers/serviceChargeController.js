const { ServiceCharge, Tariff } = require('../models');
const Booking = require('../models/Booking');
const BurialEvent = require('../models/BurialEvent');

const getAllServiceCharges = async (req, res) => {
  try {
    const { status, bookingId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (bookingId) query.bookingId = bookingId;

    const charges = await ServiceCharge.find(query)
      .populate('tariffId')
      .sort({ createdAt: -1 });

    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createServiceCharge = async (req, res) => {
  try {
    const { tariffId, bookingId, burialEventId, customerCategory, isExempt, exemptionReason } = req.body;

    const tariff = await Tariff.findById(tariffId);
    if (!tariff) {
      return res.status(404).json({ error: 'Tariff not found' });
    }

    const charge = await ServiceCharge.create({
      tariffId,
      bookingId,
      burialEventId,
      amount: isExempt ? 0 : tariff.amount,
      customerCategory: customerCategory || 'Resident',
      isExempt: isExempt || false,
      exemptionReason,
      status: 'Pending',
    });

    res.status(201).json(charge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateServiceCharge = async (req, res) => {
  try {
    const charge = await ServiceCharge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!charge) {
      return res.status(404).json({ error: 'Service charge not found' });
    }
    res.json(charge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { paymentReference, paymentDate } = req.body;
    const charge = await ServiceCharge.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Paid',
        paymentReference,
        paymentDate: paymentDate || new Date(),
      },
      { new: true }
    );

    if (!charge) {
      return res.status(404).json({ error: 'Service charge not found' });
    }

    res.json(charge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllServiceCharges,
  createServiceCharge,
  updateServiceCharge,
  recordPayment,
};
