const express = require('express');
const router = express.Router();
const {
  getBurialStatistics,
  getCapacityReport,
  getRevenueReport,
  getEnquiryStatistics,
  getWorkOrderStatistics,
} = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/burials', authenticate, getBurialStatistics);
router.get('/capacity', authenticate, getCapacityReport);
router.get('/revenue', authenticate, authorize('Administrator', 'Cemetery Manager', 'Finance User'), getRevenueReport);
router.get('/enquiries', authenticate, getEnquiryStatistics);
router.get('/work-orders', authenticate, getWorkOrderStatistics);

module.exports = router;

