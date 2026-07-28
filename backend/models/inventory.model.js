// models/inventory.model.js
import db from "../config/db.js";

// ✅ Get Inventory
export const getInventory = async () => {
  const query = `
    CALL gs_schema.sp_get_inventory(NULL, NULL);
  `;

  const { rows } = await db.query(query);
  return rows[0]?.result ?? [];
};

// ✅ Get Logs by Product
export const getLogsByProduct = async (productId) => {
  const query = `
    CALL gs_schema.sp_get_logs_by_product($1, NULL);
  `;

  const { rows } = await db.query(query, [productId]);
  return rows[0]?.result ?? [];
};

// ✅ Create Inventory Log
export const createLog = async ({ product_id, change_amount, reason }) => {
  const query = `
    CALL gs_schema.sp_create_inventory_log($1, $2, $3, NULL);
  `;

  const { rows } = await db.query(query, [
    product_id,
    change_amount,
    reason
  ]);

  return rows[0]?.new_id ?? null;
};
