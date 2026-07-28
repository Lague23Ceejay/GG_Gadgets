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
router.post('/', verifyToken, requireRole('admin'), controller.create);

// UPDATE customer (admin-only)
router.put('/:id', verifyToken, requireRole('admin'), validateNumeric('id'), controller.update);

// ARCHIVE customer (admin-only)
router.delete('/:id', verifyToken, requireRole('admin'), validateNumeric('id'), controller.archive);

export default router;