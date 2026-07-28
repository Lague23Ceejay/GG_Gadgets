import OrderModel from '../models/orders.model.js';

export const getAll = async (req, res) => {
  const data = await OrderModel.getAllOrders();
  res.json(data);
};

export const getOne = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  const data = await OrderModel.getOrderById(id);

  if (!data) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(data);
};

export const create = async (req, res) => {
  const { customer_id, extra } = req.body || {};

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  const payload = {
    customer_id,
    extra: extra ?? {}
  };

  const order = await OrderModel.createOrder(payload);

  res.status(201).json(order);
};

export const updateStatus = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  const success = await OrderModel.updateOrderStatus(id, status);

  res.json({ success });
};

export const archive = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  const success = await OrderModel.archiveOrder(id);

  res.json({ success });
};

// =========================
// ORDER ITEMS
// =========================

export const addItem = async (req, res) => {
  const { order_id, product_id, quantity, price_each, details } = req.body;

  try {
    const item = await OrderModel.addOrderItem({
      order_id,
      product_id,
      quantity,
      price_each,
      details
    });

    res.status(201).json(item);
  } catch (err) {
    // sp_add_order_item raises this when stock is too low to fulfill the request
    if (err.code === 'P0001') {
      return res.status(409).json({ error: err.message || 'Insufficient stock' });
    }
    console.error('Error adding order item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteItem = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid order item id' });
  }

  const success = await OrderModel.deleteOrderItem(id);

  res.json({ success });
};