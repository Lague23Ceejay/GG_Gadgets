import db from "../config/db.js";

const OrderModel = {
  // ✅ Create Order
  createOrder: async ({ customer_id, extra }) => {
    const query = `
      CALL gs_schema.sp_create_order($1, $2, NULL);
    `;

    const { rows } = await db.query(query, [
      customer_id,
      extra ?? {}
    ]);

    return rows[0]?.new_id ?? null;
  },

  // ✅ Get Order by ID
  getOrderById: async (id) => {
    const query = `
      CALL gs_schema.sp_get_order_by_id($1, NULL);
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0]?.result ?? null;
  },

  // ✅ Get All Orders
  getAllOrders: async () => {
    const query = `
      CALL gs_schema.sp_get_all_orders(NULL, NULL);
    `;

    const { rows } = await db.query(query);
    return rows[0]?.result ?? [];
  },

  // ✅ Update Order Status
  updateOrderStatus: async (id, status) => {
    const query = `
      CALL gs_schema.sp_update_order_status($1, $2, NULL);
    `;

    const { rows } = await db.query(query, [id, status]);
    return rows[0]?.success ?? false;
  },

  // ✅ Archive Order
  archiveOrder: async (id) => {
    const query = `
      CALL gs_schema.sp_archive_order($1, NULL);
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0]?.success ?? false;
  },

  // ✅ Add Order Item
  addOrderItem: async ({ order_id, product_id, quantity, price_each, details }) => {
    const query = `
      CALL gs_schema.sp_add_order_item($1, $2, $3, $4, $5, NULL);
    `;

    const { rows } = await db.query(query, [
      order_id,
      product_id,
      quantity,
      price_each,
      details ?? {}
    ]);

    return rows[0]?.new_id ?? null;
  },

  // ✅ Track Order
  trackOrder: async (orderId, email) => {
    const query = `
      CALL gs_schema.sp_track_order($1, $2, NULL);
    `;

  const { rows } = await db.query(query, [orderId, email]);
  return rows[0]?.result ?? null;
},

  // ✅ Delete Order Item
  deleteOrderItem: async (id) => {
    const query = `
      CALL gs_schema.sp_delete_order_item($1, NULL);
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0]?.success ?? false;
  }
};

export default OrderModel;
