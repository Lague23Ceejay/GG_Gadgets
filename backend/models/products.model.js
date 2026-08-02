import db from "../config/db.js";

// ✅ Create Product
export const createProduct = async ({
  name,
  description,
  price,
  stock,
  category_id,
  attributes
}) => {
  const query = `
    CALL gs_schema.sp_create_product($1, $2, $3, $4, $5, $6, NULL);
  `;

  const { rows } = await db.query(query, [
    name,
    description,
    price,
    stock,
    category_id,
    attributes
  ]);

  return rows[0] ?? null;
};

// ✅ Get Product by ID
export const getProductById = async (id) => {
  const query = `
    CALL gs_schema.sp_get_product_by_id($1, NULL);
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0]?.result ?? null;
};

// ✅ Get All Products
export const getAllProducts = async () => {
  const query = `
    CALL gs_schema.sp_get_all_products(NULL, NULL);
  `;

  const { rows } = await db.query(query);
  return rows[0]?.result ?? [];
};

// ✅ Update Product
export const updateProduct = async (id, payload) => {
  const {
    name,
    description,
    price,
    stock,
    category_id,
    attributes
  } = payload;

  const query = `
    CALL gs_schema.sp_update_product(
      $1, $2, $3, $4, $5, $6, NULL
    );
  `;

  const { rows } = await db.query(query, [
    id,
    name,
    description,
    price,
    stock,
    category_id,
    attributes
  ]);

  return rows[0]?.success ?? false;
};

// ✅ Archive Product
export const archiveProduct = async (id) => {
  const query = `
    CALL gs_schema.sp_archive_product($1, NULL);
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0]?.success ?? false;
};

// ✅ Add Product Image
export const addProductImage = async (productId, imageUrl, isPrimary, caption) => {
  const query = `
    CALL gs_schema.sp_add_product_image($1, $2, $3, $4, NULL);
  `;

  const { rows } = await db.query(query, [productId, imageUrl, isPrimary ?? false, caption ?? null]);
  return rows[0]?.new_id ?? null;
};

export const updateImageCaption = async (imageId, caption) => {
  const query = `
    CALL gs_schema.sp_update_product_image_caption($1, $2, NULL);
  `;

  const { rows } = await db.query(query, [imageId, caption]);
  return rows[0]?.success ?? false;
};

// ✅ Get Product Images
export const getProductImages = async (productId) => {
  const query = `
    CALL gs_schema.sp_get_product_images($1, NULL);
  `;

  const { rows } = await db.query(query, [productId]);
  return rows[0]?.result ?? [];
};

// ✅ Delete Product Image
export const deleteProductImage = async (imageId) => {
  const query = `
    CALL gs_schema.sp_delete_product_image($1, NULL);
  `;

  const { rows } = await db.query(query, [imageId]);
  return rows[0]?.success ?? false;
};

// ✅ Assign Category to Product
export const assignCategory = async (productId, categoryId) => {
  const query = `
    CALL gs_schema.sp_assign_product_category($1, $2, NULL);
  `;

  const { rows } = await db.query(query, [productId, categoryId]);
  return rows[0]?.success ?? false;
};

// ✅ Remove Category from Product
export const removeCategory = async (productId, categoryId) => {
  const query = `
    CALL gs_schema.sp_remove_product_category($1, $2, NULL);
  `;

  const { rows } = await db.query(query, [productId, categoryId]);
  return rows[0]?.success ?? false;
};