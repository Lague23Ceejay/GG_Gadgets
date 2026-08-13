import db from "../config/db.js";

export const getKpis = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_sales_kpis(NULL, NULL);`);
  return rows[0]?.result ?? {};
};

export const getCategoryBreakdown = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_category_breakdown(NULL, NULL);`);
  return rows[0]?.result ?? [];
};

export const getCategoryDetail = async (categoryId) => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_category_detail($1, NULL);`, [categoryId]);
  return rows[0]?.result ?? null;
};

export const getProductSalesTable = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_product_sales_table(NULL, NULL);`);
  return rows[0]?.result ?? [];
};

export const getRewardsAnalyticsTable = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_rewards_analytics_table(NULL, NULL);`);
  return rows[0]?.result ?? [];
};