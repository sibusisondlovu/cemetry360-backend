const express = require('express');
const router = express.Router();
const {
  getAllDeceased,
  getDeceasedById,
  createDeceased,
  updateDeceased,
  searchDeceased,
} = require('../controllers/deceasedController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllDeceased);
router.get('/search', authenticate, searchDeceased);
router.get('/:id', authenticate, getDeceasedById);
// Undertakers can view deceased records
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk', 'Funeral Undertaker'), auditLog('Deceased', 'Create'), createDeceased);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Deceased', 'Update'), updateDeceased);

module.exports = router;

