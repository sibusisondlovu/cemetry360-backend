const express = require('express');
const router = express.Router();
const {
  getAllExhumations,
  getExhumationById,
  createExhumation,
  updateExhumation,
  approveExhumation,
} = require('../controllers/exhumationController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllExhumations);
router.get('/:id', authenticate, getExhumationById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Exhumation', 'Create'), createExhumation);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Exhumation', 'Update'), updateExhumation);
router.post('/:id/approve', authenticate, authorize('Administrator', 'Cemetery Manager'), approveExhumation);

module.exports = router;

