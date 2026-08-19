import db from "../config/db.js";

export const getActiveEvents = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_active_promo_events(NULL, NULL);`);
  return rows[0]?.result ?? [];
};

export const getAllEvents = async () => {
  const { rows } = await db.query(`CALL gs_schema.sp_get_all_promo_events(NULL, NULL);`);
  return rows[0]?.result ?? [];
};

export const createEvent = async ({ title, description, image_url, discount_percent, link_url, is_active, starts_at, ends_at }) => {
  const query = `CALL gs_schema.sp_create_promo_event($1, $2, $3, $4, $5, $6, $7, $8, NULL);`;
  const { rows } = await db.query(query, [
    title, description ?? null, image_url,
    discount_percent ?? null, link_url ?? null, is_active ?? true,
    starts_at ?? null, ends_at ?? null
  ]);
  return rows[0]?.new_id ?? null;
};

export const updateEvent = async (id, { title, description, image_url, discount_percent, link_url, is_active, starts_at, ends_at }) => {
  const query = `CALL gs_schema.sp_update_promo_event($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL);`;
  const { rows } = await db.query(query, [
    id, title, description ?? null, image_url,
    discount_percent ?? null, link_url ?? null, is_active ?? true,
    starts_at ?? null, ends_at ?? null
  ]);
  return rows[0]?.success ?? false;
};

export const archiveEvent = async (id) => {
  const { rows } = await db.query(`CALL gs_schema.sp_archive_promo_event($1, NULL);`, [id]);
  return rows[0]?.success ?? false;
};

export const setEventProduct = async (eventId, productId, discountPercent) => {
  const { rows } = await db.query(
    `CALL gs_schema.sp_set_event_product($1, $2, $3, NULL);`,
    [eventId, productId, discountPercent]
  );
  return rows[0]?.success ?? false;
};

export const removeEventProduct = async (eventId, productId) => {
  const { rows } = await db.query(
    `CALL gs_schema.sp_remove_event_product($1, $2, NULL);`,
    [eventId, productId]
  );
  return rows[0]?.success ?? false;
};