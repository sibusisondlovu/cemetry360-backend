const { BurialEvent, Deceased, Plot, Cemetery, Crematorium, Booking } = require('../models');

const getAllBurials = async (req, res) => {
  try {
    const { serviceType } = req.query;
    const query = {};
    if (serviceType) query.serviceType = serviceType;

    const burials = await BurialEvent.find(query)
      .populate('deceasedId')
      .populate({
        path: 'plotId',
        populate: { path: 'sectionId', model: 'Section' }
      })
      .sort({ burialDate: -1 })
      .limit(100);

    res.json(burials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBurialById = async (req, res) => {
  try {
    const burial = await BurialEvent.findById(req.params.id)
      .populate('deceasedId')
      .populate('plotId');

    if (!burial) {
      return res.status(404).json({ error: 'Burial event not found' });
    }
    res.json(burial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBurial = async (req, res) => {
  try {
    const { plotId, deceasedId, crematoriumId, serviceType, bookingId } = req.body;

    // For burials, check plot availability
    if (serviceType === 'Burial' && plotId) {
      const plot = await Plot.findById(plotId);
      if (!plot) {
        return res.status(404).json({ error: 'Plot not found' });
      }

      if (plot.currentBurials >= plot.allowedBurials) {
        return res.status(400).json({ error: 'Plot has reached maximum burials' });
      }
    }

    const burial = await BurialEvent.create(req.body);

    // Update plot status if it's a burial
    if (plotId && serviceType === 'Burial') {
      await Plot.findByIdAndUpdate(plotId, {
        $inc: { currentBurials: 1 },
        status: 'Occupied',
      });
    }

    // If linked to a booking, update booking status to Completed
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'Completed'
      });
    } else if (deceasedId && plotId) {
      // Try to find and update related booking
      const relatedBooking = await Booking.findOne({
        deceasedId,
        plotId,
        status: { $in: ['Pending', 'Confirmed'] }
      }).sort({ createdAt: -1 });
      
      if (relatedBooking) {
        await Booking.findByIdAndUpdate(relatedBooking._id, {
          status: 'Completed'
        });
      }
    }

    res.status(201).json(burial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateBurial = async (req, res) => {
  try {
    const burial = await BurialEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('deceasedId')
      .populate('plotId');

    if (!burial) {
      return res.status(404).json({ error: 'Burial event not found' });
    }

    res.json(burial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const confirmBurial = async (req, res) => {
  try {
    const burial = await BurialEvent.findByIdAndUpdate(
      req.params.id,
      {
        confirmed: true,
        confirmedBy: req.user._id,
        confirmedAt: new Date(),
      },
      { new: true }
    );

    if (!burial) {
      return res.status(404).json({ error: 'Burial event not found' });
    }

    res.json(burial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllBurials,
  getBurialById,
  createBurial,
  updateBurial,
  confirmBurial,
};
