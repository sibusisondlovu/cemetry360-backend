const express = require('express');
const router = express.Router();
const {
  getAllCemeteries,
  getCemeteryById,
  createCemetery,
  updateCemetery,
  deleteCemetery,
  getCemeteryStats,
} = require('../controllers/cemeteryController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllCemeteries);
router.get('/:id', authenticate, getCemeteryById);
router.get('/:id/stats', authenticate, getCemeteryStats);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager'), auditLog('Cemetery', 'Create'), createCemetery);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager'), auditLog('Cemetery', 'Update'), updateCemetery);
router.delete('/:id', authenticate, authorize('Administrator'), auditLog('Cemetery', 'Delete'), deleteCemetery);

module.exports = router;

