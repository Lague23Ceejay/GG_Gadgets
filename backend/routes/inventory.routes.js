import express from 'express';
import * as controller from '../controllers/inventory.controller.js';
import { validateNumeric } from '../middleware/validateId.js';
import validateInventoryLog from '../middleware/validateInventoryLog.js';
import verifyToken from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// GET full inventory list (admin-only)
router.get(
  '/',
  verifyToken,
  requireRole('super_admin', 'store_manager', 'fulfillment'),
  controller.getAll
);

// GET logs for a specific product (admin-only)
router.get(
  '/:id/logs',
  verifyToken,
  requireRole('super_admin', 'store_manager', 'fulfillment'),
  validateNumeric('id'),
  controller.getLogs
);

// CREATE inventory log entry (admin-only)
router.post(
  '/',
  verifyToken,
  requireRole('super_admin', 'store_manager', 'fulfillment'),
  validateInventoryLog,
  controller.create
);

export default router;
