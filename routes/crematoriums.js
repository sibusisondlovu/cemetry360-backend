const express = require('express');
const router = express.Router();
const {
  getAllCrematoriums,
  getCrematoriumById,
  createCrematorium,
  updateCrematorium,
  deleteCrematorium,
} = require('../controllers/crematoriumController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllCrematoriums);
router.get('/:id', authenticate, getCrematoriumById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager'), auditLog('Crematorium', 'Create'), createCrematorium);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager'), auditLog('Crematorium', 'Update'), updateCrematorium);
router.delete('/:id', authenticate, authorize('Administrator'), auditLog('Crematorium', 'Delete'), deleteCrematorium);

module.exports = router;

