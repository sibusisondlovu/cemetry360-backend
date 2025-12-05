const express = require('express');
const router = express.Router();
const {
  getAllBurials,
  getBurialById,
  createBurial,
  updateBurial,
  confirmBurial,
} = require('../controllers/burialController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllBurials);
router.get('/:id', authenticate, getBurialById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Burial Officer', 'Cemetery Clerk'), auditLog('BurialEvent', 'Create'), createBurial);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Burial Officer', 'Cemetery Clerk'), auditLog('BurialEvent', 'Update'), updateBurial);
router.post('/:id/confirm', authenticate, authorize('Administrator', 'Cemetery Manager', 'Burial Officer', 'Cemetery Clerk'), confirmBurial);

module.exports = router;

