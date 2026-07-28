#!/usr/bin/env node
// scripts/generate-mermaid-diagram.js
// Generates a Mermaid (graph LR) diagram of your project's routes/controllers/models/middleware

const fs = require('fs').promises;
const path = require('path');

const root = process.cwd();
const outDir = path.join(root, 'diagrams');
const outFile = path.join(outDir, 'gg-gadgets-diagram.mmd');

async function listFiles(dir) {
  let results = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(dir, it.name);
      if (it.isDirectory()) {
        results = results.concat(await listFiles(full));
      } else {
        results.push(full);
      }
    }
  } catch (e) {
    // ignore missing folders
  }
  return results;
}

function shortName(fullPath) {
  return path.basename(fullPath);
}

async function readSafe(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch (e) {
    return '';
  }
}

function findMatches(content, regex) {
  const set = new Set();
  let m;
  while ((m = regex.exec(content))) {
    set.add(m[1]);
  }
  return [...set];
}

async function run() {
  const folders = ['routes', 'controllers', 'models', 'middleware', 'config'];
  const files = {};
  for (const f of folders) {
    const dir = path.join(root, f);
    const list = await listFiles(dir);
    files[f] = list;
  }

  // maps
  const routes = files['routes'] || [];
  const controllers = files['controllers'] || [];
  const models = files['models'] || [];
  const middleware = files['middleware'] || [];

  // read contents
  const routeContents = {};
  for (const r of routes) routeContents[shortName(r)] = await readSafe(r);
  const controllerContents = {};
  for (const c of controllers) controllerContents[shortName(c)] = await readSafe(c);

  // patterns
  const controllerImportModelRegex = /(?:require|import).*['"]\.\.\/models\/(\w+)(?:\.model)?['"]/g;
  const appRoutesRegex = /(?:require|import).*['"][\./]*routes\/(\w+)(?:\.routes)?['"]/g;

  const edges = [];

  // app/server -> routes (scan root files for routes imports)
  const roots = ['app.js', 'server.js', 'index.js'];
  for (const rfile of roots) {
    const full = path.join(root, rfile);
    const content = await readSafe(full);
    if (content) {
      const matches = findMatches(content, appRoutesRegex);
      for (const m of matches) {
        const routeFile = files['routes'].find(p => path.basename(p).includes(m));
        if (routeFile) edges.push({ from: path.basename(rfile), to: path.basename(routeFile) });
      }
    }
  }

  // routes -> controllers (detect import patterns inside route files or via naming convention)
  const routesRegex = /(?:require|import).*['"](?:\.\/?|\.{2}\/)?controllers\/(\w+)(?:\.controller)?['"]/g;
  for (const [rname, content] of Object.entries(routeContents)) {
    const matches = findMatches(content, routesRegex);
    if (matches.length) {
      for (const m of matches) {
        const cfile = controllers.find(p => path.basename(p).includes(m));
        if (cfile) edges.push({ from: rname, to: path.basename(cfile) });
        else edges.push({ from: rname, to: `${m}.controller.js` });
      }
    } else {
      const base = rname.replace(/\.routes?\.js$/i, '');
      const expected = `${base}.controller.js`;
      if (controllers.some(p => path.basename(p).toLowerCase() === expected.toLowerCase())) {
        edges.push({ from: rname, to: expected });
      }
    }

    const mwMatches = content.match(/middleware|require\(['"].*middleware.*['"]\)|require\(['"].*\/middleware\//i);
    if (mwMatches) {
      edges.push({ from: rname, to: 'middleware/' });
    }
  }

  // controllers -> models
  for (const [cname, content] of Object.entries(controllerContents)) {
    const matches = findMatches(content, controllerImportModelRegex);
    if (matches.length) {
      for (const m of matches) {
        const mfile = models.find(p => path.basename(p).includes(m));
        if (mfile) edges.push({ from: cname, to: path.basename(mfile) });
        else edges.push({ from: cname, to: `${m}.model.js` });
      }
    } else {
      const base = cname.replace(/\.controller\.js$/i, '');
      const expected = `${base}.model.js`;
      if (models.some(p => path.basename(p).toLowerCase() === expected.toLowerCase())) {
        edges.push({ from: cname, to: expected });
      }
    }
  }

  // build mermaid
  const lines = ['graph LR'];
  lines.push('  subgraph App');
  lines.push('    app["App / server"]');
  lines.push('  end');

  if (routes.length) {
    lines.push('  subgraph Routes');
    for (const r of routes) lines.push(`    ${nodeIdFrom(r)}["${path.basename(r)}"]`);
    lines.push('  end');
  }
  if (controllers.length) {
    lines.push('  subgraph Controllers');
    for (const c of controllers) lines.push(`    ${nodeIdFrom(c)}["${path.basename(c)}"]`);
    lines.push('  end');
  }
  if (models.length) {
    lines.push('  subgraph Models');
    for (const m of models) lines.push(`    ${nodeIdFrom(m)}["${path.basename(m)}"]`);
    lines.push('  end');
  }
  if (middleware.length) {
    lines.push('  subgraph Middleware');
    for (const m of middleware) lines.push(`    ${nodeIdFrom(m)}["${path.basename(m)}"]`);
    lines.push('  end');
  }

  // connect app to detected routes
  for (const r of routes) {
    const short = path.basename(r);
    lines.push(`  app --> ${nodeId(short)}`);
  }

  for (const e of edges) {
    const from = sanitizeNode(e.from);
    const to = sanitizeNode(e.to);
    lines.push(`  ${from} --> ${to}`);
  }

  const content = lines.join('\n');

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, content, 'utf8');
  console.log(`Mermaid diagram written to ${outFile}`);
  console.log('Open it with a Mermaid previewer or paste at https://mermaid.live/');
}

function sanitizeNode(name) {
  const id = nodeId(name);
  return id;
}

function nodeIdFrom(fullPath) {
  return nodeId(path.basename(fullPath));
}

function nodeId(name) {
  const id = name.replace(/[^a-zA-Z0-9_]/g, '_');
  return /^[0-9]/.test(id) ? `n_${id}` : id;
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
