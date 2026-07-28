import Joi from "joi";

const orderSchema = Joi.object({
  customer_id: Joi.number().integer().positive().required().messages({
    "any.required": "customer_id is required",
    "number.base": "customer_id must be a number",
    "number.integer": "customer_id must be an integer",
    "number.positive": "customer_id must be positive"
  }),

  extra: Joi.object().optional()
});

export function validateOrder(req, res, next) {
  const { error, value } = orderSchema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  req.validatedOrder = value;
  next();
}

export default validateOrder;
