const { Deceased, BurialEvent, Plot } = require('../models');

const getAllDeceased = async (req, res) => {
  try {
    const { search, dateFrom, dateTo } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } },
        { alias: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      query.dateOfDeath = {};
      if (dateFrom) query.dateOfDeath.$gte = new Date(dateFrom);
      if (dateTo) query.dateOfDeath.$lte = new Date(dateTo);
    }

    const deceased = await Deceased.find(query)
      .sort({ dateOfDeath: -1 })
      .limit(100);
    
    const deceasedWithBurials = await Promise.all(deceased.map(async (person) => {
      const burials = await BurialEvent.find({ deceasedId: person._id }).populate('plotId');
      const personObj = person.toObject();
      personObj.burials = burials;
      return personObj;
    }));

    res.json(deceasedWithBurials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDeceasedById = async (req, res) => {
  try {
    const deceased = await Deceased.findById(req.params.id);
    if (!deceased) {
      return res.status(404).json({ error: 'Deceased not found' });
    }

    const burials = await BurialEvent.find({ deceasedId: deceased._id })
      .populate({
        path: 'plotId',
        populate: { path: 'sectionId', model: 'Section' }
      });

    const deceasedObj = deceased.toObject();
    deceasedObj.burials = burials;

    res.json(deceasedObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDeceased = async (req, res) => {
  try {
    const deceased = await Deceased.create(req.body);
    res.status(201).json(deceased);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateDeceased = async (req, res) => {
  try {
    const deceased = await Deceased.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!deceased) {
      return res.status(404).json({ error: 'Deceased not found' });
    }
    res.json(deceased);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchDeceased = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const deceased = await Deceased.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { idNumber: { $regex: q, $options: 'i' } },
        { alias: { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ dateOfDeath: -1 })
      .limit(20);

    res.json(deceased);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDeceased,
  getDeceasedById,
  createDeceased,
  updateDeceased,
  searchDeceased,
};
