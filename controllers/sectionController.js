const { Section, Cemetery, Plot } = require('../models');

const getAllSections = async (req, res) => {
  try {
    const { cemeteryId } = req.query;
    const query = {};
    if (cemeteryId) query.cemeteryId = cemeteryId;

    const sections = await Section.find(query)
      .populate('cemeteryId')
      .sort({ name: 1 });

    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('cemeteryId');

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const plots = await Plot.find({ sectionId: section._id });
    const sectionObj = section.toObject();
    sectionObj.plots = plots;

    res.json(sectionObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
};
