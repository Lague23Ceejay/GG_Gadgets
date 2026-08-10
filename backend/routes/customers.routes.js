import express from 'express';
import * as controller from '../controllers/customers.controller.js';
import { validateNumeric } from '../middleware/validateId.js';
import verifyToken from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// GET all customers
router.get('/', controller.getAll);

// GET one customer
router.get('/:id', validateNumeric('id'), controller.getOne);

// CREATE customer (admin-only)
router.post('/', verifyToken, requireRole('super_admin', 'store_manager'), controller.create);

// UPDATE customer (admin-only)
router.put('/:id', verifyToken, requireRole('super_admin', 'store_manager'), validateNumeric('id'), controller.update);

// ARCHIVE customer (admin-only)
router.delete('/:id', verifyToken, requireRole('super_admin', 'store_manager'), validateNumeric('id'), controller.archive);
// GET customer summary (admin-only)
router.get('/:id/summary', verifyToken, requireRole('super_admin', 'store_manager'), validateNumeric('id'), controller.getSummary);

export default router;