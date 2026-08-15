export const lookup = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'code is required' });

  try {
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'No product found for that barcode.' });
    }

    const item = data.items[0];
    res.json({
      title: item.title ?? null,
      description: item.description ?? null,
      image_url: item.images?.[0] ?? null,
    });
  } catch (err) {
    console.error('Barcode lookup failed:', err);
    res.status(502).json({ error: 'Barcode lookup service is unavailable right now.' });
  }
};