import express from 'express';
import * as controller from '../controllers/products.controller.js';
import { validateNumeric } from '../middleware/validateId.js';
import validateProduct from '../middleware/validateProduct.js';
import verifyToken from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// GET all products
router.get('/', controller.getAll);

// GET one product
router.get('/:id', validateNumeric('id'), controller.getOne);

// CREATE product (admin-only)
router.post(
  '/',
  verifyToken,
  requireRole('super_admin', 'store_manager'),
  validateProduct,
  controller.create
);

// UPDATE product (admin-only)
router.put(
  '/:id',
  verifyToken,
  requireRole('super_admin', 'store_manager'),
  validateNumeric('id'),
  validateProduct,
  controller.update
);

// ARCHIVE product (admin-only)
router.delete(
  '/:id',
  verifyToken,
  requireRole('super_admin', 'store_manager'),
  validateNumeric('id'),
  controller.archive
);

// =========================
// PRODUCT IMAGES
// =========================

// LIST images for a product
router.get('/:id/images', validateNumeric('id'), controller.listImages);

// ADD image to a product (admin-only)
router.post(
  '/:id/images',
  verifyToken,
  requireRole('super_admin', 'store_manager'),
  validateNumeric('id'),
  controller.addImage
);

// DELETE an image (admin-only)
router.delete(
  '/images/:imageId',
  verifyToken,
  requireRole('super_admin', 'store_manager'),
  controller.deleteImage
);

// =========================
// PRODUCT <-> CATEGORY LINKS
// =========================

// ASSIGN a category to a product (admin-only)
router.post(
  '/:id/categories',
  verifyToken,
  requireRole('super_admin', 'store_manager'),
  validateNumeric('id'),
  controller.assignCategory
);

// REMOVE a category from a product (admin-only)
router.delete(
  '/:id/categories/:categoryId',
  verifyToken,
  requireRole('super_admin', 'store_manager'),
  validateNumeric('id'),
  controller.removeCategory
);

export default router;