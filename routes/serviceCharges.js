const express = require('express');
const router = express.Router();
const {
  getAllServiceCharges,
  createServiceCharge,
  updateServiceCharge,
  recordPayment,
} = require('../controllers/serviceChargeController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllServiceCharges);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('ServiceCharge', 'Create'), createServiceCharge);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Finance User', 'Cemetery Clerk'), auditLog('ServiceCharge', 'Update'), updateServiceCharge);
router.post('/:id/payment', authenticate, authorize('Administrator', 'Finance User', 'Cemetery Clerk'), recordPayment);

module.exports = router;

