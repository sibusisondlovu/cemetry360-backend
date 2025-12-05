const express = require('express');
const router = express.Router();
const {
  getCalendarEvents,
  checkBookingConflict,
} = require('../controllers/calendarController');
const { authenticate } = require('../middleware/auth');

router.get('/events', authenticate, getCalendarEvents);
router.post('/check-conflict', authenticate, checkBookingConflict);

module.exports = router;


