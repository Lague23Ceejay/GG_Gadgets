# GG Gadgets — Frontend

React + TypeScript + Vite + Tailwind. Public storefront + JWT-gated admin panel, both with a
dark/light toggle (styled as a power switch — the brand's signature UI touch).

## Folder placement

This folder goes **next to** your backend folder, not inside it:

```
GG-Gadgets/
├── backend/     ← your existing Express project (rename "GG Gadgets" → "backend")
└── frontend/    ← this folder
```

## Local setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend isn't on http://localhost:3000
npm run dev
```

Opens at http://localhost:5173. Make sure your backend is running on the URL in 
or in http://localhost:5174
`VITE_API_URL`.

## What's built

**Storefront** (public, no login):
- `/` — home page, hero + live product grid pulled from `GET /products`
- `/products/:id` — product detail, add to cart
- `/cart` — cart, checkout form (creates a customer + order via the API)

**Admin** (JWT-gated, `/admin/login` → `POST /auth/login`):
- `/admin` — dashboard with summary stats
- `/admin/products` — full CRUD (create, edit, archive) against `/products`

**Not yet built** (stubbed with a comment in `App.tsx`) — follow the same pattern as
`src/pages/admin/Products.tsx`:
- `/admin/categories`
- `/admin/customers`
- `/admin/orders` (including updating order status, adding/removing order items)
- `/admin/inventory`

Ask me to build any of these next and I'll follow the same table + form pattern already
established in the Products page.

## Architecture notes

- `src/lib/api.ts` — typed fetch wrapper, attaches the JWT from `localStorage` automatically
- `src/context/AuthContext.tsx` — login/logout, persists user + token
- `src/context/ThemeContext.tsx` — dark/light, persists to `localStorage`, respects OS preference on first load
- `src/context/CartContext.tsx` — client-side cart, persists to `localStorage` (no backend cart table exists — this is intentionally local-only until/unless you want server-side carts)
- Path alias `@/` → `src/` (configured in both `tsconfig.json` and `vite.config.ts`)

## Deploying to Vercel

1. Push this repo to GitHub (frontend + backend as sibling folders is fine in one repo).
2. In Vercel: **New Project** → import the repo → set **Root Directory** to `frontend`.
3. Framework preset: Vite (should auto-detect).
4. Add an environment variable: `VITE_API_URL` = your deployed backend's URL + `/api/v1`
   (e.g. `https://your-backend.onrender.com/api/v1`). **Note:** your Express backend needs to be
   hosted somewhere that supports long-running Node processes — Vercel's serverless functions
   aren't a great fit for the `pg` connection pool pattern in `config/db.js`. Render, Railway, or
   Fly.io are common choices; only the frontend needs to be on Vercel.
5. Deploy.

### Using Vercel Blob for product images

Your backend already has the pieces for this — `product_images` table, and
`POST /products/:id/images` which just stores a URL string. The flow:

1. On the admin "add image" form (not yet built), upload the file directly to Vercel Blob from
   the client using `@vercel/blob/client` (needs a small Vercel serverless function to generate
   an upload token — Vercel Blob docs cover this under "client uploads").
2. Once Blob returns the public URL, call your existing `POST /products/:id/images` with
   `{ image_url: <blob url> }`.
3. No backend schema changes needed — it already expects a URL string, not a file.

I haven't wired this up yet since it needs a Vercel Blob token to test against. Say the word
when you're ready and I'll build the upload component + the small serverless function it needs.

## CORS note

Your backend currently has `app.use(cors())` in `app.js` with no options, which allows requests
from any origin — so your Vercel-deployed frontend will work against it with no backend changes
needed. Since you authenticate via a Bearer token in the `Authorization` header (not cookies),
this is reasonably safe. If you want to tighten it later for production, restrict it to your
specific frontend domain:

```js
app.use(cors({ origin: ["https://your-app.vercel.app", "http://localhost:5173"] }));
```

but this isn't required to get things working.
