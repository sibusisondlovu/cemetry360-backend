const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  confirmBooking,
  getCalendarBookings,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllBookings);
router.get('/calendar', authenticate, getCalendarBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Booking', 'Create'), createBooking);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Booking', 'Update'), updateBooking);
router.post('/:id/confirm', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), confirmBooking);

module.exports = router;

