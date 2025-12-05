const { Owner, Ownership, Plot } = require('../models');

const getAllOwners = async (req, res) => {
  try {
    const owners = await Owner.find()
      .populate({
        path: 'ownerships',
        populate: { path: 'plotId', model: 'Plot' }
      })
      .sort({ name: 1 });

    const ownersWithOwnerships = await Promise.all(owners.map(async (owner) => {
      const ownerships = await Ownership.find({ ownerId: owner._id }).populate('plotId');
      const ownerObj = owner.toObject();
      ownerObj.ownerships = ownerships;
      return ownerObj;
    }));

    res.json(ownersWithOwnerships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    const ownerships = await Ownership.find({ ownerId: owner._id }).populate('plotId');
    const ownerObj = owner.toObject();
    ownerObj.ownerships = ownerships;

    res.json(ownerObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createOwner = async (req, res) => {
  try {
    const owner = await Owner.create(req.body);
    res.status(201).json(owner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOwner = async (req, res) => {
  try {
    const owner = await Owner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createOwnership = async (req, res) => {
  try {
    const { ownerId, plotId, rightIssueDate, validityPeriod, validityUnit } = req.body;

    const expiryDate = validityUnit === 'Perpetual' 
      ? null 
      : new Date(new Date(rightIssueDate).setFullYear(new Date(rightIssueDate).getFullYear() + validityPeriod));

    const ownership = await Ownership.create({
      ownerId,
      plotId,
      rightIssueDate,
      validityPeriod,
      validityUnit,
      expiryDate,
      approvedBy: req.user._id,
    });

    await Plot.findByIdAndUpdate(plotId, { status: 'Reserved' });

    res.status(201).json(ownership);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const transferOwnership = async (req, res) => {
  try {
    const { ownershipId, newOwnerId, transferReason } = req.body;

    const oldOwnership = await Ownership.findById(ownershipId);
    if (!oldOwnership) {
      return res.status(404).json({ error: 'Ownership not found' });
    }

    await Ownership.findByIdAndUpdate(ownershipId, {
      isActive: false,
      transferredFrom: oldOwnership.ownerId,
      transferDate: new Date(),
      transferReason,
    });

    const newOwnership = await Ownership.create({
      ownerId: newOwnerId,
      plotId: oldOwnership.plotId,
      rightIssueDate: new Date(),
      validityPeriod: oldOwnership.validityPeriod,
      validityUnit: oldOwnership.validityUnit,
      transferredFrom: oldOwnership.ownerId,
      transferDate: new Date(),
      transferReason,
      approvedBy: req.user._id,
    });

    res.json(newOwnership);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  createOwnership,
  transferOwnership,
};
