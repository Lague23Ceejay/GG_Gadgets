// models/categories.model.js
import db from "../config/db.js";

// ✅ Create Category
export const createCategory = async ({ name, description }) => {
  const query = `
    CALL gs_schema.sp_create_category($1, $2, NULL);
  `;

  const { rows } = await db.query(query, [name, description]);
  return rows[0]?.new_id ?? null;
};

// ✅ Get Category by ID
export const getCategoryById = async (id) => {
  const query = `
    CALL gs_schema.sp_get_category_by_id($1, NULL);
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0]?.result ?? null;
};

// ✅ Get All Categories
export const getAllCategories = async () => {
  const query = `
    CALL gs_schema.sp_get_all_categories(NULL, NULL);
  `;

  const { rows } = await db.query(query);
  return rows[0]?.result ?? [];
};

// ✅ Update Category
export const updateCategory = async (id, { name, description }) => {
  const query = `
    CALL gs_schema.sp_update_category($1, $2, $3, NULL);
  `;

  const { rows } = await db.query(query, [id, name, description]);
  return rows[0]?.success ?? false;
};

// ✅ Archive Category
export const archiveCategory = async (id) => {
  const query = `
    CALL gs_schema.sp_archive_category($1, NULL);
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0]?.success ?? false;
};
