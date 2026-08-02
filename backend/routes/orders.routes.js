import express from 'express';
import * as controller from '../controllers/orders.controller.js';
import { validateNumeric } from '../middleware/validateId.js';
import verifyToken from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/requireRole.js';
import validateOrder from '../middleware/validateOrder.js';
import validateOrderItem from '../middleware/validateOrderItem.js';
import validateOrderStatus from '../middleware/validateOrderStatus.js';

const router = express.Router();

// All three roles need visibility into orders to do their jobs
const CAN_VIEW = requireRole('super_admin', 'store_manager', 'fulfillment');
// Creating orders / editing line items is a catalog-adjacent operation —
// Fulfillment only touches status, not order composition
const CAN_EDIT_ITEMS = requireRole('super_admin', 'store_manager');
// Fulfillment's actual job: move orders through their lifecycle
const CAN_UPDATE_STATUS = requireRole('super_admin', 'store_manager', 'fulfillment');
// Deleting order history is destructive — Fulfillment is explicitly blocked from this
const CAN_ARCHIVE = requireRole('super_admin', 'store_manager');

// =========================
// ORDERS
// =========================

router.get('/', verifyToken, CAN_VIEW, controller.getAll);
router.get('/:id', verifyToken, CAN_VIEW, validateNumeric('id'), controller.getOne);
router.post('/', verifyToken, CAN_EDIT_ITEMS, validateOrder, controller.create);

router.put(
  '/:id/status',
  verifyToken,
  CAN_UPDATE_STATUS,
  validateNumeric('id'),
  validateOrderStatus,
  controller.updateStatus
);

router.delete('/:id', verifyToken, CAN_ARCHIVE, validateNumeric('id'), controller.archive);

// =========================
// ORDER ITEMS
// =========================

router.post('/items', verifyToken, CAN_EDIT_ITEMS, validateOrderItem, controller.addItem);
router.delete('/items/:id', verifyToken, CAN_EDIT_ITEMS, validateNumeric('id'), controller.deleteItem);

export default router;