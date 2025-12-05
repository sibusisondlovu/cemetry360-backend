const { BurialEvent, Plot, Cemetery, Booking, Enquiry, WorkOrder, ServiceCharge } = require('../models');

const getBurialStatistics = async (req, res) => {
  try {
    const { dateFrom, dateTo, cemeteryId } = req.query;
    const query = {};

    if (dateFrom || dateTo) {
      query.burialDate = {};
      if (dateFrom) query.burialDate.$gte = new Date(dateFrom);
      if (dateTo) query.burialDate.$lte = new Date(dateTo);
    }

    const burials = await BurialEvent.find(query)
      .populate({
        path: 'plotId',
        populate: {
          path: 'sectionId',
          populate: { path: 'cemeteryId', model: 'Cemetery' }
        }
      });

    const stats = {
      total: burials.length,
      byType: {},
      byCemetery: {},
      byMonth: {},
    };

    burials.forEach(burial => {
      stats.byType[burial.serviceType] = (stats.byType[burial.serviceType] || 0) + 1;
      const cemeteryName = burial.plotId?.sectionId?.cemeteryId?.name || 'Unknown';
      stats.byCemetery[cemeteryName] = (stats.byCemetery[cemeteryName] || 0) + 1;

      const month = new Date(burial.burialDate).toISOString().substring(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCapacityReport = async (req, res) => {
  try {
    const { cemeteryId } = req.query;
    const query = {};

    if (cemeteryId) {
      const Section = require('../models/Section');
      const sections = await Section.find({ cemeteryId });
      query.sectionId = { $in: sections.map(s => s._id) };
    }

    const plots = await Plot.find(query);

    const stats = {
      total: plots.length,
      available: plots.filter(p => p.status === 'Available').length,
      occupied: plots.filter(p => p.status === 'Occupied').length,
      reserved: plots.filter(p => p.status === 'Reserved').length,
      closed: plots.filter(p => p.status === 'Closed').length,
      utilizationRate: plots.length > 0
        ? ((plots.filter(p => p.status === 'Occupied').length / plots.length) * 100).toFixed(2)
        : 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const query = { status: 'Paid' };

    if (dateFrom || dateTo) {
      query.paymentDate = {};
      if (dateFrom) query.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) query.paymentDate.$lte = new Date(dateTo);
    }

    const charges = await ServiceCharge.find(query).populate('tariffId');

    const totalRevenue = charges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

    const byServiceType = {};
    charges.forEach(charge => {
      const serviceType = charge.tariffId?.serviceType || 'Other';
      byServiceType[serviceType] = (byServiceType[serviceType] || 0) + parseFloat(charge.amount);
    });

    res.json({
      totalRevenue,
      transactionCount: charges.length,
      byServiceType,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEnquiryStatistics = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const query = {};

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const enquiries = await Enquiry.find(query);

    const stats = {
      total: enquiries.length,
      byStatus: {},
      byCategory: {},
    };

    enquiries.forEach(enquiry => {
      stats.byStatus[enquiry.status] = (stats.byStatus[enquiry.status] || 0) + 1;
      stats.byCategory[enquiry.category] = (stats.byCategory[enquiry.category] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWorkOrderStatistics = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const query = {};

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const workOrders = await WorkOrder.find(query);

    const stats = {
      total: workOrders.length,
      byStatus: {},
      byPriority: {},
      byTaskType: {},
    };

    workOrders.forEach(wo => {
      stats.byStatus[wo.status] = (stats.byStatus[wo.status] || 0) + 1;
      stats.byPriority[wo.priority] = (stats.byPriority[wo.priority] || 0) + 1;
      stats.byTaskType[wo.taskType] = (stats.byTaskType[wo.taskType] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBurialStatistics,
  getCapacityReport,
  getRevenueReport,
  getEnquiryStatistics,
  getWorkOrderStatistics,
};
