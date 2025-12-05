const express = require('express');
const router = express.Router();
const {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
} = require('../controllers/sectionController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllSections);
router.get('/:id', authenticate, getSectionById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager'), auditLog('Section', 'Create'), createSection);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager'), auditLog('Section', 'Update'), updateSection);

module.exports = router;

