const paths = [
  '../middleware/requireRole.js',
  '../middleware/validateId.js',
  '../models/inventory.model.js'
];

(async () => {
  for (const p of paths) {
    try {
      const mod = await import(p);
      console.log(p, '->', Object.keys(mod));
      if ('default' in mod) {
        console.log('  has default export');
      } else {
        console.log('  no default export');
      }
    } catch (err) {
      console.error(p, 'import error:', err.message);
    }
  }
})();