import { logActivity } from "../models/activityLog.model.js";

// dynamic model import to avoid ESM/CJS startup import issues

export const getAll = async (req, res) => {
  try {
    const mod = await import('../models/customers.model.js');
    const CustomerModel = mod.default ?? mod;
    const data = await CustomerModel.getAllCustomers();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOne = async (req, res) => {
  try {
    const mod = await import('../models/customers.model.js');
    const CustomerModel = mod.default ?? mod;
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid customer id' });
    }

    const data = await CustomerModel.getCustomerById(id);
    if (!data) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching customer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req, res) => {
  try {
    const mod = await import('../models/customers.model.js');
    const CustomerModel = mod.default ?? mod;

    const { full_name, email, phone, metadata } = req.body || {};

    if (!full_name) {
      return res.status(400).json({ error: 'full_name is required' });
    }

    try {
      const newId = await CustomerModel.createCustomer({
        full_name,
        email,
        phone,
        metadata: metadata ?? {}
      });

      return res.status(201).json({ customer_id: newId });
    } catch (err) {
      if (err.code === '23505' && email) {
        const existing = await CustomerModel.getCustomerByEmail(email);
        if (existing) {
          return res.status(200).json({ customer_id: existing.customer_id, existing: true });
        }
      }
      throw err;
    }
  } catch (err) {
    console.error('Error creating customer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const update = async (req, res) => {
  try {
    const mod = await import('../models/customers.model.js');
    const CustomerModel = mod.default ?? mod;
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid customer id' });
    }

    const success = await CustomerModel.updateCustomer(id, req.body);

    if (!success) {
      return res.status(404).json({ error: 'Customer not found or no changes applied' });
    }

    return res.json({ success });
  } catch (err) {
    console.error('Error updating customer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const archive = async (req, res) => {
  try {
    const mod = await import('../models/customers.model.js');
    const CustomerModel = mod.default ?? mod;
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid customer id' });
    }

    const success = await CustomerModel.archiveCustomer(id);

    if (!success) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({ success });
  } catch (err) {
    console.error('Error archiving customer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSummary = async (req, res) => {
  try {
    const mod = await import('../models/settings.model.js');
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid customer id' });
    }
    const data = await mod.getCustomerSummaryAdmin(id);
    res.json(data);
  } catch (err) {
    console.error('Error fetching customer summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};