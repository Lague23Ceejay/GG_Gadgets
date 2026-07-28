import Joi from "joi";

const orderItemSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  price_each: Joi.number().positive().required(),
  details: Joi.object().optional()
});

export function validateOrderItem(req, res, next) {
  const { error, value } = orderItemSchema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  req.validatedOrderItem = value;
  next();
}

export default validateOrderItem;
