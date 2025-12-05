const { Exhumation, Plot, Deceased } = require('../models');

const getAllExhumations = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const exhumations = await Exhumation.find(query)
      .populate('plotId')
      .populate('deceasedId')
      .sort({ applicationDate: -1 });

    res.json(exhumations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExhumationById = async (req, res) => {
  try {
    const exhumation = await Exhumation.findById(req.params.id)
      .populate('plotId')
      .populate('deceasedId');

    if (!exhumation) {
      return res.status(404).json({ error: 'Exhumation not found' });
    }
    res.json(exhumation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createExhumation = async (req, res) => {
  try {
    const exhumation = await Exhumation.create(req.body);
    res.status(201).json(exhumation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateExhumation = async (req, res) => {
  try {
    const { status } = req.body;
    const exhumation = await Exhumation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('plotId');
    
    if (!exhumation) {
      return res.status(404).json({ error: 'Exhumation not found' });
    }

    // If exhumation is completed, update plot status to Re-usable
    if (status === 'Completed' && exhumation.plotId) {
      await Plot.findByIdAndUpdate(exhumation.plotId._id || exhumation.plotId, {
        status: 'Re-usable',
        currentBurials: 0
      });
    }

    res.json(exhumation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const approveExhumation = async (req, res) => {
  try {
    const { healthOfficerApproval, cemeteryManagerApproval, legalApproval } = req.body;
    
    const exhumation = await Exhumation.findById(req.params.id);
    if (!exhumation) {
      return res.status(404).json({ error: 'Exhumation not found' });
    }

    const updates = {
      approvedBy: req.user._id,
    };

    if (healthOfficerApproval !== undefined) {
      updates.healthOfficerApproval = healthOfficerApproval;
    }
    if (cemeteryManagerApproval !== undefined) {
      updates.cemeteryManagerApproval = cemeteryManagerApproval;
    }
    if (legalApproval !== undefined) {
      updates.legalApproval = legalApproval;
    }

    const allApproved = 
      (updates.healthOfficerApproval !== undefined ? updates.healthOfficerApproval : exhumation.healthOfficerApproval) &&
      (updates.cemeteryManagerApproval !== undefined ? updates.cemeteryManagerApproval : exhumation.cemeteryManagerApproval) &&
      (updates.legalApproval !== undefined ? updates.legalApproval : exhumation.legalApproval);

    if (allApproved) {
      updates.status = 'Approved';
    }

    const updated = await Exhumation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllExhumations,
  getExhumationById,
  createExhumation,
  updateExhumation,
  approveExhumation,
};
