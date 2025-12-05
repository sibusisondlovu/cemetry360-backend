const { Crematorium, Cemetery } = require('../models');

const getAllCrematoriums = async (req, res) => {
  try {
    const { cemeteryId, status } = req.query;
    const query = {};

    if (cemeteryId) query.cemeteryId = cemeteryId;
    if (status) query.status = status;

    const crematoriums = await Crematorium.find(query)
      .populate('cemeteryId')
      .sort({ name: 1 });

    res.json(crematoriums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCrematoriumById = async (req, res) => {
  try {
    const crematorium = await Crematorium.findById(req.params.id)
      .populate('cemeteryId');

    if (!crematorium) {
      return res.status(404).json({ error: 'Crematorium not found' });
    }
    res.json(crematorium);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCrematorium = async (req, res) => {
  try {
    if (req.body.gpsLatitude && req.body.gpsLongitude) {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.gpsLongitude, req.body.gpsLatitude],
      };
    }

    const crematorium = await Crematorium.create(req.body);
    res.status(201).json(crematorium);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCrematorium = async (req, res) => {
  try {
    if (req.body.gpsLatitude && req.body.gpsLongitude) {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.gpsLongitude, req.body.gpsLatitude],
      };
    }

    const crematorium = await Crematorium.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!crematorium) {
      return res.status(404).json({ error: 'Crematorium not found' });
    }
    res.json(crematorium);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCrematorium = async (req, res) => {
  try {
    const crematorium = await Crematorium.findByIdAndDelete(req.params.id);
    if (!crematorium) {
      return res.status(404).json({ error: 'Crematorium not found' });
    }
    res.json({ message: 'Crematorium deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCrematoriums,
  getCrematoriumById,
  createCrematorium,
  updateCrematorium,
  deleteCrematorium,
};

