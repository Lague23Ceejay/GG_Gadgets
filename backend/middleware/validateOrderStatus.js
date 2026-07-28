const ALLOWED_STATUSES = ["pending", "completed", "cancelled"];

export function validateOrderStatus(req, res, next) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`
    });
  }

  next();
}

export default validateOrderStatus;