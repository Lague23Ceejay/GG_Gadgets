function validateNumeric(param = "id") {
  return (req, res, next) => {
    const raw = req.params[param];

    if (raw === undefined) {
      return res.status(400).json({ error: `Missing ${param}` });
    }

    const n = Number.parseInt(raw, 10);

    if (Number.isNaN(n)) {
      return res.status(400).json({ error: `Invalid ${param}` });
    }

    req.params[param] = n;
    next();
  };
}

// Export both named and default to maximize compatibility with different import styles
export { validateNumeric };
export default validateNumeric;
