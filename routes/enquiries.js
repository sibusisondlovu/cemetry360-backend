const express = require('express');
const router = express.Router();
const {
  getAllEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  resolveEnquiry,
} = require('../controllers/enquiryController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllEnquiries);
router.get('/:id', authenticate, getEnquiryById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Enquiry', 'Create'), createEnquiry);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Enquiry', 'Update'), updateEnquiry);
router.post('/:id/resolve', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), resolveEnquiry);

module.exports = router;

