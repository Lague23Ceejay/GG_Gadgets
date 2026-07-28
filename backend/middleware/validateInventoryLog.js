
import Joi from "joi";

const inventoryLogSchema = Joi.object({
  product_id: Joi.number().integer().positive().required().messages({
    "any.required": "product_id is required",
    "number.base": "product_id must be a number",
    "number.integer": "product_id must be an integer",
    "number.positive": "product_id must be positive"
  }),

  change_amount: Joi.number().integer().required().messages({
    "any.required": "change_amount is required",
    "number.base": "change_amount must be a number",
    "number.integer": "change_amount must be an integer"
  }),

  reason: Joi.string().trim().min(3).max(255).required().messages({
    "any.required": "reason is required",
    "string.min": "reason must be at least 3 characters",
    "string.max": "reason must be at most 255 characters"
  })
});

export function validateInventoryLog(req, res, next) {
  const { error, value } = inventoryLogSchema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      error: error.details[0].message
    });
  }

  req.validatedLog = value;
  next();
}

export default validateInventoryLog;
