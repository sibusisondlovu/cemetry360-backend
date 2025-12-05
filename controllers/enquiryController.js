const { Enquiry, Plot, Cemetery } = require('../models');

const generateReferenceNumber = () => {
  return `ENQ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

const getAllEnquiries = async (req, res) => {
  try {
    const { status, category, cemeteryId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (cemeteryId) query.cemeteryId = cemeteryId;

    const enquiries = await Enquiry.find(query)
      .populate('plotId')
      .sort({ createdAt: -1 });

    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate('plotId');
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEnquiry = async (req, res) => {
  try {
    const referenceNumber = generateReferenceNumber();
    const enquiry = await Enquiry.create({
      ...req.body,
      referenceNumber,
    });
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resolveEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Resolved',
        resolvedDate: new Date(),
        resolvedBy: req.user._id,
        resolutionNotes: req.body.resolutionNotes,
      },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  resolveEnquiry,
};
