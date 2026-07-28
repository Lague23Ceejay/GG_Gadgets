import express from 'express';
import * as controller from '../controllers/orders.controller.js';
import { validateNumeric } from '../middleware/validateId.js';
import verifyToken from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/requireRole.js';
import validateOrder from '../middleware/validateOrder.js';
import validateOrderItem from '../middleware/validateOrderItem.js';
import validateOrderStatus from '../middleware/validateOrderStatus.js';

const router = express.Router();

// =========================
// ORDERS
// =========================

// GET all orders (admin-only)
router.get(
  '/',
  verifyToken,
  requireRole('admin'),
  controller.getAll
);

// GET one order (admin-only)
router.get(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validateNumeric('id'),
  controller.getOne
);

// CREATE order (admin-only)
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  validateOrder,
  controller.create
);

// UPDATE order status (admin-only)
router.put(
  '/:id/status',
  verifyToken,
  requireRole('admin'),
  validateNumeric('id'),
  validateOrderStatus,
  controller.updateStatus
);

// ARCHIVE order (admin-only)
router.delete(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validateNumeric('id'),
  controller.archive
);

// =========================
// ORDER ITEMS
// =========================

// ADD item to order (admin-only)
router.post(
  '/items',
  verifyToken,
  requireRole('admin'),
  validateOrderItem,
  controller.addItem
);

// DELETE order item (admin-only)
router.delete(
  '/items/:id',
  verifyToken,
  requireRole('admin'),
  validateNumeric('id'),
  controller.deleteItem
);

export default router;