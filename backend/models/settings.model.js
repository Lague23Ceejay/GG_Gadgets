import db from "../config/db.js";

export const getPublicSettings = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_public_settings(NULL, NULL);`);
  return rows[0]?.result ?? {};
};

export const updateSetting = async (key, value) => {
  const { rows } = await db.query(`CALL gs_schema.sp_update_setting($1, $2, NULL);`, [key, JSON.stringify(value)]);
  return rows[0]?.success ?? false;
};

export const getCustomerOrderHistory = async (email) => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_customer_order_history($1, NULL);`, [email]);
  return rows[0]?.result ?? null;
};

export const getCustomerSummaryAdmin = async (customerId) => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_customer_summary_admin($1, NULL);`, [customerId]);
  return rows[0]?.result ?? null;
};