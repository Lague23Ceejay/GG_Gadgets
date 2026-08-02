import express from 'express';
import * as controller from '../controllers/categories.controller.js';
import { validateNumeric } from '../middleware/validateId.js';
import verifyToken from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// GET all categories
router.get('/', controller.getAll);

// GET one category
router.get('/:id', validateNumeric('id'), controller.getOne);

// CREATE category (admin-only)
router.post('/', verifyToken, requireRole('super_admin', 'store_manager'), controller.create);

// UPDATE category (admin-only)
router.put('/:id', verifyToken, requireRole('super_admin', 'store_manager'), validateNumeric('id'), controller.update);

// ARCHIVE category (admin-only)
router.delete('/:id', verifyToken, requireRole('super_admin', 'store_manager'), validateNumeric('id'), controller.archive);

export default router;