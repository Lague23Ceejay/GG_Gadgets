// models/users.model.js
import db from "../config/db.js";

// ✅ Create User
export const createUser = async ({ username, password_hash, role }) => {
  const query = `
    CALL gs_schema.sp_create_user($1, $2, $3, NULL);
  `;

  const { rows } = await db.query(query, [username, password_hash, role]);
  return rows[0]?.new_id ?? null;
};

// ✅ Get User by ID
export const getUserById = async (id) => {
  const query = `
    CALL gs_schema.sp_get_user_by_id($1, NULL);
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0]?.result ?? null;
};

// ✅ Get User by Username
export const getUserByUsername = async (username) => {
  const query = `
    CALL gs_schema.sp_get_user_by_username($1, NULL);
  `;

  const { rows } = await db.query(query, [username]);
  return rows[0]?.result ?? null;
};

// ✅ Get All Users
export const getAllUsers = async () => {
  const query = `
    CALL gs_schema.sp_get_all_users(NULL, NULL);
  `;

  const { rows } = await db.query(query);
  return rows[0]?.result ?? [];
};

// ✅ Archive User
export const archiveUser = async (id) => {
  const query = `
    CALL gs_schema.sp_archive_user($1, NULL);
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0]?.success ?? false;
};

// ✅ Update User
export const updateUser = async ({ user_id, username, password_hash, role }) => {
  const query = `
    CALL gs_schema.sp_update_user($1, $2, $3, $4, NULL);
  `;

  const { rows } = await db.query(query, [user_id, username, password_hash ?? null, role]);
  return rows[0]?.success ?? false;
};
