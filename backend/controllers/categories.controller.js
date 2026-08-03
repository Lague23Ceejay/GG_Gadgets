export const getAll = async (req, res) => {
  try {
    const mod = await import('../models/categories.model.js');
    const CategoryModel = mod.default ?? mod;
    const data = await CategoryModel.getAllCategories();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOne = async (req, res) => {
  try {
    const mod = await import('../models/categories.model.js');
    const CategoryModel = mod.default ?? mod;
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    const data = await CategoryModel.getCategoryById(id);
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching category:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req, res) => {
  try {
    const mod = await import('../models/categories.model.js');
    const CategoryModel = mod.default ?? mod;
    if (!req.body?.name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Stored procedure returns full object
    const category = await CategoryModel.createCategory(req.body);

    return res.status(201).json({ category_id: category });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const mod = await import('../models/categories.model.js');
    const CategoryModel = mod.default ?? mod;
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    const success = await CategoryModel.updateCategory(id, req.body);

    if (!success) {
      return res.status(404).json({ error: 'Category not found or no changes applied' });
    }

    return res.json({ success });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const archive = async (req, res) => {
  try {
    const mod = await import('../models/categories.model.js');
    const CategoryModel = mod.default ?? mod;
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    const success = await CategoryModel.archiveCategory(id);

    if (!success) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json({ success });
  } catch (err) {
    console.error('Error archiving category:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
