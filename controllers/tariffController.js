const { Tariff, ServiceCharge } = require('../models');

const getAllTariffs = async (req, res) => {
  try {
    const { serviceType, isActive } = req.query;
    const query = {};

    if (serviceType) query.serviceType = serviceType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const tariffs = await Tariff.find(query)
      .sort({ serviceType: 1, effectiveDate: -1 });

    res.json(tariffs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTariffById = async (req, res) => {
  try {
    const tariff = await Tariff.findById(req.params.id);
    if (!tariff) {
      return res.status(404).json({ error: 'Tariff not found' });
    }
    res.json(tariff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTariff = async (req, res) => {
  try {
    const tariff = await Tariff.create(req.body);
    res.status(201).json(tariff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTariff = async (req, res) => {
  try {
    const tariff = await Tariff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tariff) {
      return res.status(404).json({ error: 'Tariff not found' });
    }
    res.json(tariff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getActiveTariff = async (req, res) => {
  try {
    const { serviceType, customerCategory } = req.query;
    const query = {
      isActive: true,
      serviceType,
      customerCategory: customerCategory || 'Resident',
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } },
      ],
      effectiveDate: { $lte: new Date() },
    };

    const tariff = await Tariff.findOne(query).sort({ effectiveDate: -1 });

    if (!tariff) {
      return res.status(404).json({ error: 'No active tariff found' });
    }

    res.json(tariff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTariffs,
  getTariffById,
  createTariff,
  updateTariff,
  getActiveTariff,
};
