export async function validateProduct(req, res, next) {
  try {
    const body = req.body || {};

    const name = body.name && String(body.name).trim();
    const price =
      body.price === undefined ? undefined : Number.parseFloat(body.price);

    const rawStock = body.stock;
    const stock =
      rawStock === undefined ? 0 : Number.parseInt(rawStock, 10);

    const category_id =
      body.category_id === undefined
        ? undefined
        : Number.parseInt(body.category_id, 10);

    const attributes = body.attributes ?? body.metadata ?? {};

    // ============================
    // VALIDATION RULES
    // ============================

    if (!name) {
      return res
        .status(400)
        .json({ error: "Invalid product data: name required" });
    }

    if (price === undefined || Number.isNaN(price) || price < 0) {
      return res.status(400).json({
        error: "Invalid product data: price must be a non-negative number",
      });
    }

    if (Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({
        error: "Invalid product data: stock must be a non-negative integer",
      });
    }

    if (typeof attributes !== "object" || Array.isArray(attributes)) {
      return res.status(400).json({
        error: "Invalid product data: attributes must be an object",
      });
    }

    if (category_id !== undefined) {
      if (Number.isNaN(category_id)) {
        return res.status(400).json({
          error: "Invalid product data: category_id must be an integer",
        });
      }

      // dynamically import the categories model to avoid startup-time model imports
      const mod = await import("../models/categories.model.js");
      const CategoryModel = mod.default ?? mod;

      const cat = await CategoryModel.getCategoryById(category_id);
      if (!cat) {
        return res.status(400).json({
          error: "Invalid product data: category_id not found",
        });
      }
    }

    // ============================
    // NORMALIZED PAYLOAD
    // ============================

    req.validatedProduct = {
      name,
      description: body.description,
      price,
      stock,
      category_id,
      attributes,
    };
    next();
  } catch (err) {
    next(err);
  }
}

export default validateProduct;
