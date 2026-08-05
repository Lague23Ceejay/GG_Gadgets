import { logActivity } from "../models/activityLog.model.js";

export const getAll = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;
  const data = await ProductModel.getAllProducts();
  res.json(data);
};

export const getOne = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;
  const id = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const data = await ProductModel.getProductById(id);

  if (!data) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(data);
};

export const create = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;
  const payload = req.validatedProduct ?? req.body;

  // Stored procedure returns new_id (integer)
  const newProductId = await ProductModel.createProduct(payload);

  res.status(201).json({ product_id: newProductId });

  logActivity(req.user, "Created product", { product_id: newProductId, name: payload.name });
};

export const update = async (req, res) => {
  try {
    const mod = await import('../models/products.model.js');
    const ProductModel = mod.default ?? mod;
    const payload = req.validatedProduct ?? req.body;

    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const success = await ProductModel.updateProduct(id, payload);

    res.json({ success });
    logActivity(req.user, "Updated product", { product_id: id, name: payload.name });

  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const archive = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;

  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const success = await ProductModel.archiveProduct(id);

  res.json({ success });
  logActivity(req.user, "Archived order", { order_id: id });
};

// =========================
// PRODUCT IMAGES
// =========================

export const listImages = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;

  const productId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const images = await ProductModel.getProductImages(productId);
  res.json(images);
};

export const addImage = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;

  const productId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const { image_url, is_primary, caption } = req.body || {};
  if (!image_url) {
    return res.status(400).json({ error: 'image_url is required' });
  }

  const imageId = await ProductModel.addProductImage(productId, image_url, is_primary, caption ?? null);
  res.status(201).json({ image_id: imageId });
};

export const updateImageCaption = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;

  const imageId = Number.parseInt(req.params.imageId, 10);
  if (Number.isNaN(imageId)) {
    return res.status(400).json({ error: 'Invalid image id' });
  }

  const { caption } = req.body || {};
  const success = await ProductModel.updateImageCaption(imageId, caption ?? null);
  res.json({ success });
};

export const deleteImage = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;

  const imageId = Number.parseInt(req.params.imageId, 10);
  if (Number.isNaN(imageId)) {
    return res.status(400).json({ error: 'Invalid image id' });
  }

  const success = await ProductModel.deleteProductImage(imageId);
  res.json({ success });
};

// =========================
// PRODUCT <-> CATEGORY LINKS
// =========================

export const assignCategory = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;

  const productId = Number.parseInt(req.params.id, 10);
  const { category_id } = req.body || {};
  const categoryId = Number.parseInt(category_id, 10);

  if (Number.isNaN(productId) || Number.isNaN(categoryId)) {
    return res.status(400).json({ error: 'Valid product id and category_id are required' });
  }

  const success = await ProductModel.assignCategory(productId, categoryId);
  res.status(201).json({ success });
};

export const removeCategory = async (req, res) => {
  const mod = await import('../models/products.model.js');
  const ProductModel = mod.default ?? mod;

  const productId = Number.parseInt(req.params.id, 10);
  const categoryId = Number.parseInt(req.params.categoryId, 10);

  if (Number.isNaN(productId) || Number.isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid product id or category id' });
  }

  const success = await ProductModel.removeCategory(productId, categoryId);
  res.json({ success });
};