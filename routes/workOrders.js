const express = require('express');
const router = express.Router();
const {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  completeWorkOrder,
} = require('../controllers/workOrderController');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

router.get('/', authenticate, getAllWorkOrders);
router.get('/:id', authenticate, getWorkOrderById);
router.post('/', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('WorkOrder', 'Create'), createWorkOrder);
router.put('/:id', authenticate, authorize('Administrator', 'Cemetery Manager', 'Cemetery Clerk'), auditLog('WorkOrder', 'Update'), updateWorkOrder);
router.post('/:id/complete', authenticate, authorize('Administrator', 'Cemetery Manager', 'Burial Officer', 'Cemetery Clerk'), completeWorkOrder);

module.exports = router;

