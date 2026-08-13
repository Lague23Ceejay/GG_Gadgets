import db from "../config/db.js";
import crypto from "crypto";

const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");

export const getBalance = async (email) => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_loyalty_balance($1, NULL);`, [email]);
  return rows[0]?.result ?? { email, active_points: 0 };
};

export const getActiveRewards = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_active_rewards(NULL, NULL);`);
  return rows[0]?.result ?? [];
};

export const getAllRewards = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_all_rewards(NULL, NULL);`);
  return rows[0]?.result ?? [];
};

export const createReward = async ({ item_name, point_cost, stock_count, image_url, is_high_end }) => {
  const query = `CALL gs_schema.sp_create_reward($1, $2, $3, $4, $5, NULL);`;
  const { rows } = await db.query(query, [item_name, point_cost, stock_count, image_url ?? null, is_high_end ?? false]);
  return rows[0]?.new_id ?? null;
};

export const updateReward = async (id, { item_name, point_cost, stock_count, image_url, is_active, is_high_end }) => {
  const query = `CALL gs_schema.sp_update_reward($1, $2, $3, $4, $5, $6, $7, NULL);`;
  const { rows } = await db.query(query, [id, item_name, point_cost, stock_count, image_url ?? null, is_active, is_high_end ?? false]);
  return rows[0]?.success ?? false;
};

export const archiveReward = async (id) => {
  const { rows } = await db.query(`CALL gs_schema.sp_archive_reward($1, NULL);`, [id]);
  return rows[0]?.success ?? false;
};

export const createOtp = async (email) => {
  const code = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit
  await db.query(`CALL gs_schema.sp_create_otp($1, $2, NULL);`, [email, hashCode(code)]);
  return code;
};

export const verifyOtp = async (email, code) => {
  const { rows } = await db.query(`CALL gs_schema.sp_verify_otp($1, $2, NULL);`, [email, hashCode(code)]);
  return rows[0]?.success ?? false;
};

export const redeemReward = async (email, rewardId, orderId) => {
  const { rows } = await db.query(`CALL gs_schema.sp_redeem_reward($1, $2, $3, NULL);`, [email, rewardId, orderId]);
  return rows[0]?.result ?? { success: false, error: "Unknown error" };
};