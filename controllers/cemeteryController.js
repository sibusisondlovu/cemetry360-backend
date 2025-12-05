const { Cemetery, Section, Plot } = require('../models');

const getAllCemeteries = async (req, res) => {
  try {
    const cemeteries = await Cemetery.find().sort({ name: 1 });
    res.json(cemeteries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCemeteryById = async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    if (!cemetery) {
      return res.status(404).json({ error: 'Cemetery not found' });
    }
    
    const sections = await Section.find({ cemeteryId: cemetery._id });
    const cemeteryObj = cemetery.toObject();
    cemeteryObj.sections = sections;
    
    res.json(cemeteryObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCemetery = async (req, res) => {
  try {
    const cemetery = await Cemetery.create(req.body);
    res.status(201).json(cemetery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCemetery = async (req, res) => {
  try {
    const cemetery = await Cemetery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!cemetery) {
      return res.status(404).json({ error: 'Cemetery not found' });
    }
    res.json(cemetery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCemetery = async (req, res) => {
  try {
    const cemetery = await Cemetery.findByIdAndDelete(req.params.id);
    if (!cemetery) {
      return res.status(404).json({ error: 'Cemetery not found' });
    }
    res.json({ message: 'Cemetery deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCemeteryStats = async (req, res) => {
  try {
    const cemetery = await Cemetery.findById(req.params.id);
    if (!cemetery) {
      return res.status(404).json({ error: 'Cemetery not found' });
    }

    const sections = await Section.find({ cemeteryId: cemetery._id });
    const sectionIds = sections.map(s => s._id);
    const plots = await Plot.find({ sectionId: { $in: sectionIds } });

    const stats = {
      totalPlots: plots.length,
      availablePlots: plots.filter(p => p.status === 'Available').length,
      occupiedPlots: plots.filter(p => p.status === 'Occupied').length,
      utilizationRate: plots.length > 0
        ? ((plots.filter(p => p.status === 'Occupied').length / plots.length) * 100).toFixed(2)
        : 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCemeteries,
  getCemeteryById,
  createCemetery,
  updateCemetery,
  deleteCemetery,
  getCemeteryStats,
};
