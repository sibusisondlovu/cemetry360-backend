const { Undertaker, Booking, BurialEvent, Deceased, User } = require('../models');

const getUndertakerProfile = async (req, res) => {
  try {
    const undertaker = await Undertaker.findOne({ userId: req.user._id });
    if (!undertaker) {
      return res.status(404).json({ error: 'Undertaker profile not found' });
    }
    
    // Include document validation status
    const validation = validateUndertakerDocuments(undertaker);
    const undertakerObj = undertaker.toObject();
    undertakerObj.documentValidation = {
      isValid: validation.isValid,
      errors: validation.errors,
    };
    
    res.json(undertakerObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUndertakerProfile = async (req, res) => {
  try {
    const undertaker = await Undertaker.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!undertaker) {
      return res.status(404).json({ error: 'Undertaker profile not found' });
    }
    res.json(undertaker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const undertaker = await Undertaker.findOne({ userId: req.user._id });
    if (!undertaker) {
      return res.status(404).json({ error: 'Undertaker profile not found' });
    }

    const bookings = await Booking.find({
      $or: [
        { undertakerId: undertaker._id },
        { undertakerName: undertaker.businessName },
      ],
    })
      .populate('plotId')
      .populate('deceasedId')
      .populate('cemeteryId')
      .sort({ requestedDate: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validation function to check undertaker documents
const validateUndertakerDocuments = (undertaker) => {
  const errors = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check Certificate of Competence (CoC)
  if (!undertaker.certificateOfCompetence) {
    errors.push('Valid Certificate of Competence (CoC) is required');
  } else if (undertaker.certificateExpiryDate && new Date(undertaker.certificateExpiryDate) < today) {
    errors.push('Certificate of Competence (CoC) has expired');
  }

  // Check DHA Designation Number
  if (!undertaker.dhaDesignationNumber) {
    errors.push('Valid DHA Designation Number is required');
  }

  // Check Business License
  if (!undertaker.businessLicense) {
    errors.push('Valid Business License is required');
  } else if (undertaker.businessLicenseExpiryDate && new Date(undertaker.businessLicenseExpiryDate) < today) {
    errors.push('Business License has expired');
  }

  // Check Tax Registration
  if (!undertaker.taxRegistrationNumber) {
    errors.push('Valid Tax Registration Number is required');
  } else if (undertaker.taxRegistrationExpiryDate && new Date(undertaker.taxRegistrationExpiryDate) < today) {
    errors.push('Tax Registration has expired');
  }

  // Check Association Membership Proof
  if (!undertaker.associationMembershipProof) {
    errors.push('Proof of Association Membership is required');
  } else if (undertaker.associationMembershipExpiryDate && new Date(undertaker.associationMembershipExpiryDate) < today) {
    errors.push('Association Membership has expired');
  }

  // Check if undertaker is active
  if (!undertaker.isActive) {
    errors.push('Undertaker account is not active');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const createBooking = async (req, res) => {
  try {
    const undertaker = await Undertaker.findOne({ userId: req.user._id });
    if (!undertaker) {
      return res.status(404).json({ error: 'Undertaker profile not found' });
    }

    // Validate undertaker documents before allowing booking
    const validation = validateUndertakerDocuments(undertaker);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Cannot create booking: Required documents are missing or expired',
        details: validation.errors,
      });
    }

    const booking = await Booking.create({
      ...req.body,
      undertakerId: undertaker._id,
      undertakerName: undertaker.businessName,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateMyBooking = async (req, res) => {
  try {
    const undertaker = await Undertaker.findOne({ userId: req.user._id });
    if (!undertaker) {
      return res.status(404).json({ error: 'Undertaker profile not found' });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [
        { undertakerId: undertaker._id },
        { undertakerName: undertaker.businessName },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyBurials = async (req, res) => {
  try {
    const undertaker = await Undertaker.findOne({ userId: req.user._id });
    if (!undertaker) {
      return res.status(404).json({ error: 'Undertaker profile not found' });
    }

    const burials = await BurialEvent.find({
      $or: [
        { undertakerId: undertaker._id },
        { undertakerName: undertaker.businessName },
      ],
    })
      .populate('deceasedId')
      .populate('plotId')
      .sort({ burialDate: -1 });

    res.json(burials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAvailablePlots = async (req, res) => {
  try {
    const { cemeteryId, graveType } = req.query;
    const query = { status: 'Available' };

    if (cemeteryId) {
      const Section = require('../models/Section');
      const sections = await Section.find({ cemeteryId });
      query.sectionId = { $in: sections.map(s => s._id) };
    }
    if (graveType) query.graveType = graveType;

    const Plot = require('../models/Plot');
    const plots = await Plot.find(query)
      .populate('sectionId')
      .limit(100)
      .sort({ uniqueIdentifier: 1 });

    res.json(plots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAvailableCrematoriums = async (req, res) => {
  try {
    const { cemeteryId, date, time } = req.query;
    const query = { status: 'Active' };

    if (cemeteryId) query.cemeteryId = cemeteryId;

    const Crematorium = require('../models/Crematorium');
    const crematoriums = await Crematorium.find(query).populate('cemeteryId');

    // Check availability for specific date/time
    if (date && time) {
      const availableCrematoriums = await Promise.all(
        crematoriums.map(async (crem) => {
          const conflictingBookings = await Booking.countDocuments({
            crematoriumId: crem._id,
            requestedDate: new Date(date),
            status: { $in: ['Pending', 'Confirmed'] },
          });

          return {
            ...crem.toObject(),
            available: conflictingBookings < crem.capacity,
            bookingsCount: conflictingBookings,
          };
        })
      );

      return res.json(availableCrematoriums);
    }

    res.json(crematoriums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTariffs = async (req, res) => {
  try {
    const Tariff = require('../models/Tariff');
    const tariffs = await Tariff.find({ isActive: true }).sort({ serviceType: 1 });
    res.json(tariffs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDeceased = async (req, res) => {
  try {
    const undertaker = await Undertaker.findOne({ userId: req.user._id });
    if (!undertaker) {
      return res.status(404).json({ error: 'Undertaker profile not found' });
    }

    const deceased = await Deceased.create(req.body);
    res.status(201).json(deceased);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCemeteries = async (req, res) => {
  try {
    const cemeteries = await Cemetery.find({ status: 'Open' }).sort({ name: 1 });
    res.json(cemeteries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUndertakerProfile,
  updateUndertakerProfile,
  getMyBookings,
  createBooking,
  updateMyBooking,
  getMyBurials,
  getAvailablePlots,
  getAvailableCrematoriums,
  getTariffs,
  createDeceased,
  getCemeteries,
};

