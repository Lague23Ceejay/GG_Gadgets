// models/customers.model.js
import db from "../config/db.js";

// ✅ Get All Customers (uses your view, no change needed)
export const getAllCustomers = async () => {
  try {
    const result = await db.query(
      "SELECT customer_id, full_name, email, archived, archive_reason FROM gs_schema.api_customer_profile_vu ORDER BY full_name ASC"
    );

    // ✅ Add placeholder for phone
    return result.rows.map((r) => ({ ...r, phone: null }));
  } catch (err) {
    console.error("DB Error: getAllCustomers", err);
    throw err;
  }
};



// ✅ Get Customer by ID (procedure version)
export const getCustomerById = async (id) => {
  try {
    const query = `
      CALL gs_schema.sp_get_customer_by_id($1, NULL);
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0]?.result ?? null;
  } catch (err) {
    console.error("DB Error: getCustomerById", err);
    throw err;
  }
};

// ✅ Create Customer (procedure version)
export const createCustomer = async ({ full_name, email, phone, metadata }) => {
  try {
    const query = `
      CALL gs_schema.sp_create_customer($1, $2, $3, $4, NULL);
    `;

    const { rows } = await db.query(query, [
      full_name,
      email,
      phone,
      metadata
    ]);

    return rows[0]?.new_id ?? null;
  } catch (err) {
    console.error("DB Error: createCustomer", err);
    throw err;
  }
};

// ✅ Update Customer (procedure version)
export const updateCustomer = async (id, { full_name, email, phone, metadata }) => {
  try {
    const query = `
      CALL gs_schema.sp_update_customer($1, $2, $3, $4, $5, NULL);
    `;

    const { rows } = await db.query(query, [
      id,
      full_name,
      email,
      phone,
      metadata
    ]);

    return rows[0]?.success ?? false;
  } catch (err) {
    console.error("DB Error: updateCustomer", err);
    throw err;
  }
};

// ✅ Archive Customer (procedure version)
export const archiveCustomer = async (id) => {
  try {
    const query = `
      CALL gs_schema.sp_archive_customer($1, NULL);
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0]?.success ?? false;
  } catch (err) {
    console.error("DB Error: archiveCustomer", err);
    throw err;
  }
};

export const getCustomerByEmail = async (email) => {
  const query = `CALL gs_schema.sp_get_customer_by_email($1, NULL);`;
  const { rows } = await db.query(query, [email]);
  return rows[0]?.result ?? null;
};
