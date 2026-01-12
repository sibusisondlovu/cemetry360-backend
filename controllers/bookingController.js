const { Booking, Plot, Deceased, Cemetery, Crematorium } = require('../models');
const moment = require('moment');

const getAllBookings = async (req, res) => {
  try {
    const { status, cemeteryId, dateFrom, dateTo, deceasedId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (cemeteryId) query.cemeteryId = cemeteryId;
    if (deceasedId) query.deceasedId = deceasedId;
    if (dateFrom || dateTo) {
      query.requestedDate = {};
      if (dateFrom) query.requestedDate.$gte = new Date(dateFrom);
      if (dateTo) query.requestedDate.$lte = new Date(dateTo);
    }

    const bookings = await Booking.find(query)
      .populate('plotId')
      .populate('deceasedId')
      .populate('cemeteryId')
      .sort({ requestedDate: 1, requestedTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('plotId')
      .populate('deceasedId')
      .populate('cemeteryId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { plotId, crematoriumId, requestedDate, requestedTime, serviceDuration, bufferMinutes, serviceType } = req.body;

    // For cremations, check crematorium availability
    if (serviceType === 'Cremation' && crematoriumId) {
      const crematorium = await Crematorium.findById(crematoriumId);
      if (!crematorium) {
        return res.status(404).json({ error: 'Crematorium not found' });
      }

      if (crematorium.status !== 'Active') {
        return res.status(400).json({ error: 'Crematorium is not active' });
      }

      // Check for conflicting crematorium bookings
      const startTime = moment(`${requestedDate} ${requestedTime}`);
      const endTime = startTime.clone().add(serviceDuration + bufferMinutes, 'minutes');

      const conflictingBookings = await Booking.find({
        crematoriumId,
        status: { $in: ['Pending', 'Confirmed'] },
        requestedDate: new Date(requestedDate),
        requestedTime: {
          $gte: requestedTime,
          $lte: endTime.format('HH:mm:ss'),
        },
      });

      if (conflictingBookings.length >= crematorium.capacity) {
        return res.status(400).json({ error: 'Crematorium is fully booked for this time slot' });
      }
    } else if (plotId) {
      // For burials, check plot availability
      const plot = await Plot.findById(plotId);
      if (!plot) {
        return res.status(404).json({ error: 'Plot not found' });
      }

      if (plot.status !== 'Available' && plot.status !== 'Reserved') {
        return res.status(400).json({ error: 'Plot is not available for booking' });
      }

      const startTime = moment(`${requestedDate} ${requestedTime}`);
      const endTime = startTime.clone().add(serviceDuration + bufferMinutes, 'minutes');

      const conflictingBookings = await Booking.find({
        plotId,
        status: { $in: ['Pending', 'Confirmed'] },
        requestedDate: new Date(requestedDate),
        requestedTime: {
          $gte: requestedTime,
          $lte: endTime.format('HH:mm:ss'),
        },
      });

      if (conflictingBookings.length > 0) {
        return res.status(400).json({ error: 'Time slot already booked' });
      }
    }
    // Removed strict check: else { return res.status(400).json({ error: 'Either plotId or crematoriumId is required' }); }
    // Allowing bookings without plot/crematorium (e.g. initial inquiry or service only)

    const confirmationNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const booking = await Booking.create({
      ...req.body,
      confirmationNumber,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Confirmed' },
      { new: true }
    ).populate('plotId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update plot status to Reserved when booking is confirmed
    if (booking.plotId && booking.plotId.status === 'Available') {
      await Plot.findByIdAndUpdate(booking.plotId._id, {
        status: 'Reserved'
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCalendarBookings = async (req, res) => {
  try {
    const { cemeteryId, date } = req.query;
    const query = {
      status: { $in: ['Pending', 'Confirmed'] },
    };

    if (cemeteryId) query.cemeteryId = cemeteryId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.requestedDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const bookings = await Booking.find(query)
      .populate('plotId')
      .populate('deceasedId')
      .sort({ requestedTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  confirmBooking,
  getCalendarBookings,
};
