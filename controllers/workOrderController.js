const { WorkOrder, Cemetery, Plot } = require('../models');

const getAllWorkOrders = async (req, res) => {
  try {
    const { status, priority, cemeteryId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (cemeteryId) query.cemeteryId = cemeteryId;

    const workOrders = await WorkOrder.find(query)
      .populate('cemeteryId')
      .populate('plotId')
      .sort({ requestedDate: -1 });

    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWorkOrderById = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('cemeteryId')
      .populate('plotId');

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.create(req.body);
    res.status(201).json(workOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    res.json(workOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const completeWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        completedDate: new Date(),
        completedBy: req.user.fullName,
      },
      { new: true }
    );

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    res.json(workOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  completeWorkOrder,
};
