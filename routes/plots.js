const express = require('express');
const router = express.Router();
const {
  getAllPlots,
  getPlotById,
  createPlot,
  updatePlot,
  getAvailablePlots,
  getPlotsNearLocation,
  evaluatePlotReuse,
  approvePlotReuse,
} = require('../controllers/plotController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllPlots);
router.get('/available', authenticate, getAvailablePlots);
router.get('/near', authenticate, getPlotsNearLocation);
router.get('/:id', authenticate, getPlotById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Plot', 'Create'), createPlot);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('Plot', 'Update'), updatePlot);
router.post('/reuse/evaluate', authenticate, authorize('Administrator', 'Cemetery Manager'), evaluatePlotReuse);
router.post('/reuse/approve', authenticate, authorize('Administrator', 'Cemetery Manager'), auditLog('Plot', 'Reuse Approval'), approvePlotReuse);

module.exports = router;

