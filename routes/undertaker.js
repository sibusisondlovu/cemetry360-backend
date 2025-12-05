const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/undertakerController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

// All routes require authentication and Undertaker role
router.use(authenticate);
router.use(authorize('Funeral Undertaker'));

router.get('/profile', getUndertakerProfile);
router.put('/profile', auditLog('Undertaker', 'Update'), updateUndertakerProfile);
router.get('/bookings', getMyBookings);
router.post('/bookings', auditLog('Booking', 'Create'), createBooking);
router.put('/bookings/:id', auditLog('Booking', 'Update'), updateMyBooking);
router.get('/burials', getMyBurials);
router.get('/available-plots', getAvailablePlots);
router.get('/available-crematoriums', getAvailableCrematoriums);
router.get('/tariffs', getTariffs);
router.get('/cemeteries', getCemeteries);
router.post('/deceased', auditLog('Deceased', 'Create'), createDeceased);

module.exports = router;

