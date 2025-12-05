const express = require('express');
const router = express.Router();
const {
  getAllOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  createOwnership,
  transferOwnership,
} = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllOwners);
router.get('/:id', authenticate, getOwnerById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Owner', 'Create'), createOwner);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Owner', 'Update'), updateOwner);
router.post('/ownerships', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Ownership', 'Create'), createOwnership);
router.post('/ownerships/:id/transfer', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Ownership', 'Update'), transferOwnership);

module.exports = router;

