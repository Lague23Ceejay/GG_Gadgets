export const getAll = async (req, res) => {
  try {
    const mod = await import('../models/inventory.model.js');
    const InventoryModel = mod.default ?? mod;
    const data = await InventoryModel.getInventory();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLogs = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const mod = await import('../models/inventory.model.js');
    const InventoryModel = mod.default ?? mod;

    const data = await InventoryModel.getLogsByProduct(id);
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No logs found for this product' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching inventory logs:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req, res) => {
  try {
    const { product_id, change_amount, reason } = req.body || {};

    if (!product_id || !change_amount || !reason) {
      return res.status(400).json({
        error: 'product_id, change_amount, and reason are required'
      });
    }

    const mod = await import('../models/inventory.model.js');
    const InventoryModel = mod.default ?? mod;

    // Stored procedure only accepts product_id, change_amount, reason
    const log = await InventoryModel.createLog({
      product_id,
      change_amount,
      reason
    });

    return res.status(201).json(log);
  } catch (err) {
    console.error('Error creating inventory log:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
