const { BurialEvent, Booking, Plot, Crematorium } = require('../models');

const getCalendarEvents = async (req, res) => {
  try {
    const { startDate, endDate, cemeteryId, plotId, crematoriumId } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.burialDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.burialDate = { $gte: new Date(startDate) };
    }

    if (cemeteryId) {
      const Section = require('../models/Section');
      const sections = await Section.find({ cemeteryId });
      const plots = await Plot.find({ sectionId: { $in: sections.map(s => s._id) } });
      query.plotId = { $in: plots.map(p => p._id) };
    }

    if (plotId) {
      query.plotId = plotId;
    }

    if (crematoriumId) {
      query.crematoriumId = crematoriumId;
    }

    const burials = await BurialEvent.find(query)
      .populate('deceasedId')
      .populate({
        path: 'plotId',
        populate: { path: 'sectionId', populate: { path: 'cemeteryId' } }
      })
      .populate('crematoriumId')
      .sort({ burialDate: 1, burialTime: 1 });

    const bookings = await Booking.find({
      requestedDate: startDate && endDate
        ? { $gte: new Date(startDate), $lte: new Date(endDate) }
        : startDate
        ? { $gte: new Date(startDate) }
        : {},
      status: { $in: ['Pending', 'Confirmed'] },
    })
      .populate('deceasedId')
      .populate('plotId')
      .populate('crematoriumId')
      .populate('cemeteryId')
      .sort({ requestedDate: 1, requestedTime: 1 });

    // Format events for calendar
    const events = [
      ...burials.map(burial => ({
        id: burial._id,
        title: burial.deceasedId?.fullName || 'Unknown',
        start: new Date(burial.burialDate),
        end: burial.burialTime
          ? new Date(new Date(burial.burialDate).setHours(...burial.burialTime.split(':').map(Number)))
          : new Date(burial.burialDate),
        type: 'burial',
        serviceType: burial.serviceType,
        plotId: burial.plotId?._id,
        plotName: burial.plotId?.uniqueIdentifier,
        crematoriumId: burial.crematoriumId?._id,
        crematoriumName: burial.crematoriumId?.name,
        cemeteryName: burial.plotId?.sectionId?.cemeteryId?.name || burial.crematoriumId?.cemeteryId?.name,
        confirmed: burial.confirmed,
        color: burial.confirmed ? '#10b981' : '#f59e0b',
      })),
      ...bookings.map(booking => ({
        id: booking._id,
        title: booking.deceasedId?.fullName || 'Unknown',
        start: new Date(booking.requestedDate),
        end: booking.requestedTime
          ? new Date(new Date(booking.requestedDate).setHours(...booking.requestedTime.split(':').map(Number)))
          : new Date(booking.requestedDate),
        type: 'booking',
        status: booking.status,
        plotId: booking.plotId?._id,
        plotName: booking.plotId?.uniqueIdentifier,
        crematoriumId: booking.crematoriumId?._id,
        crematoriumName: booking.crematoriumId?.name,
        cemeteryName: booking.cemeteryId?.name,
        color: booking.status === 'Confirmed' ? '#3b82f6' : '#eab308',
      })),
    ];

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkBookingConflict = async (req, res) => {
  try {
    const { plotId, crematoriumId, requestedDate, requestedTime, serviceDuration, bufferMinutes } = req.body;

    if (!requestedDate) {
      return res.status(400).json({ error: 'Requested date is required' });
    }

    const conflicts = [];
    const requestedDateTime = new Date(requestedDate);
    if (requestedTime) {
      const [hours, minutes] = requestedTime.split(':').map(Number);
      requestedDateTime.setHours(hours, minutes, 0, 0);
    }

    const duration = (serviceDuration || 60) + (bufferMinutes || 30);
    const endDateTime = new Date(requestedDateTime.getTime() + duration * 60000);

    // Check plot conflicts (for burials)
    if (plotId) {
      const plotConflicts = await BurialEvent.find({
        plotId,
        burialDate: {
          $gte: new Date(requestedDate),
          $lt: new Date(new Date(requestedDate).setDate(new Date(requestedDate).getDate() + 1)),
        },
        confirmed: true,
      }).populate('deceasedId');

      const bookingConflicts = await Booking.find({
        plotId,
        requestedDate: new Date(requestedDate),
        status: { $in: ['Pending', 'Confirmed'] },
      }).populate('deceasedId');

      // Check time overlaps
      [...plotConflicts, ...bookingConflicts].forEach(event => {
        const eventStart = new Date(event.burialDate || event.requestedDate);
        if (event.burialTime || event.requestedTime) {
          const [hours, minutes] = (event.burialTime || event.requestedTime).split(':').map(Number);
          eventStart.setHours(hours, minutes, 0, 0);
        }
        const eventEnd = new Date(eventStart.getTime() + (event.serviceDuration || 60) * 60000);

        if (
          (requestedDateTime >= eventStart && requestedDateTime < eventEnd) ||
          (endDateTime > eventStart && endDateTime <= eventEnd) ||
          (requestedDateTime <= eventStart && endDateTime >= eventEnd)
        ) {
          conflicts.push({
            type: event.burialDate ? 'burial' : 'booking',
            id: event._id,
            deceasedName: event.deceasedId?.fullName || 'Unknown',
            startTime: event.burialTime || event.requestedTime,
            plotId: event.plotId?._id || event.plotId,
          });
        }
      });
    }

    // Check crematorium conflicts (for cremations)
    if (crematoriumId) {
      const crematorium = await Crematorium.findById(crematoriumId);
      if (crematorium) {
        const bookingConflicts = await Booking.find({
          crematoriumId,
          requestedDate: new Date(requestedDate),
          status: { $in: ['Pending', 'Confirmed'] },
        }).populate('deceasedId');

        const conflictCount = bookingConflicts.length;
        if (conflictCount >= crematorium.capacity) {
          conflicts.push({
            type: 'capacity',
            message: `Crematorium at full capacity (${conflictCount}/${crematorium.capacity})`,
            crematoriumId,
            crematoriumName: crematorium.name,
          });
        }

        // Check time overlaps
        bookingConflicts.forEach(booking => {
          const bookingStart = new Date(booking.requestedDate);
          if (booking.requestedTime) {
            const [hours, minutes] = booking.requestedTime.split(':').map(Number);
            bookingStart.setHours(hours, minutes, 0, 0);
          }
          const bookingEnd = new Date(bookingStart.getTime() + (booking.serviceDuration || 60) * 60000);

          if (
            (requestedDateTime >= bookingStart && requestedDateTime < bookingEnd) ||
            (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
            (requestedDateTime <= bookingStart && endDateTime >= bookingEnd)
          ) {
            conflicts.push({
              type: 'booking',
              id: booking._id,
              deceasedName: booking.deceasedId?.fullName || 'Unknown',
              startTime: booking.requestedTime,
              crematoriumId,
            });
          }
        });
      }
    }

    res.json({
      hasConflict: conflicts.length > 0,
      conflicts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCalendarEvents,
  checkBookingConflict,
};


