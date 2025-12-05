const express = require('express');
const router = express.Router();
const {
  getAllTariffs,
  getTariffById,
  createTariff,
  updateTariff,
  getActiveTariff,
} = require('../controllers/tariffController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllTariffs);
router.get('/active', authenticate, getActiveTariff);
router.get('/:id', authenticate, getTariffById);
router.post('/', authenticate, authorize('Administrator', 'Finance User'), auditLog('Tariff', 'Create'), createTariff);
router.put('/:id', authenticate, authorize('Administrator', 'Finance User'), auditLog('Tariff', 'Update'), updateTariff);

module.exports = router;

