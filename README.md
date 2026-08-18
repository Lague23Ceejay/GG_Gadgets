# GG Gadgets — Inventory & Ordering System

A full-stack e-commerce platform for a gadgets/electronics retailer: a public storefront for
browsing and checkout, and a role-gated admin panel for managing products, orders, customers,
inventory, staff accounts, and homepage promotions.

Built as an academic Advance Database project, structured with production-grade practices:
role-based access control, audit logging, database-level data integrity (triggers, stored
procedures, constraints), and a real three-service(now four for email-api 'Resend') cloud deployment.

---

## 1. System Overview

**Storefront (public):**
- Curated homepage — featured "Best Sellers" and "On Sale" product showcases, plus an
  admin-managed promotional events carousel (banner images, discount callouts, e.g. "Weekend
  Deal — Save up to 60%")
- Full shop catalog with search and category filtering
- Product detail pages with specifications, images, and sale pricing
- Cart with out-of-stock protection (items with zero stock are greyed out and block checkout)
- Guest checkout (no account required) — returning customers are recognized by email
- Guest order tracking via order number + email (no login needed)

**Admin panel (role-gated):**
- Three roles with different permission scopes: **Super Admin**, **Store Manager**,
  **Fulfillment Specialist**
- Products: full CRUD, multi-image uploads with captions, specifications list, flat or
  percentage-based discounts, "featured" flag for homepage placement
- Categories, Customers: full CRUD
- Orders: view, update status (pending/completed/cancelled), manage line items, see customer
  contact info for fulfillment
- Inventory: stock levels, manual stock adjustment logs with reasons, automatic audit trail on
  every stock change (order placed, order cancelled, manual adjustment)
- Homepage promotional events: create/pause/archive banner events shown in the storefront
  carousel
- Staff accounts: create, edit, archive staff logins (Super Admin only)
- Activity log: audit trail of staff actions across the admin panel (Super Admin only)
- Dark/light theme toggle throughout, fully responsive down to mobile viewports

**Role permissions summary:**

| Capability | Super Admin | Store Manager | Fulfillment |
|---|:---:|:---:|:---:|
| Dashboard, Orders (view), Inventory | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ✅ |
| Add/remove order line items, archive orders | ✅ | ✅ | ❌ |
| Products, Categories, Customers (CRUD) | ✅ | ✅ | ❌ |
| Homepage promo events | ✅ | ✅ | ❌ |
| Staff accounts (create/edit/archive) | ✅ | ❌ | ❌ |
| Activity log | ✅ | ❌ | ❌ |

---

## 2. Technology Stack

### Backend

| Technology | Role in the system |
|---|---|
| **Node.js** | JavaScript runtime executing the backend server |
| **Express.js** | Web framework — routing, middleware pipeline, request/response handling |
| **PostgreSQL** | Relational database — all persistent data, business logic enforced via stored procedures, triggers, and constraints (not just application code) |
| **node-postgres (`pg`)** | Database driver/connection pool between Express and PostgreSQL |
| **JWT (`jsonwebtoken`)** | Stateless authentication — issued on login, verified on every protected route |
| **bcryptjs** | Password hashing for staff accounts (never stored in plain text) |
| **cors** | Cross-origin request handling, allowing the frontend (hosted on a different domain) to call the API |
| **dotenv** | Loads environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.) from `.env` in local development |

**Architectural notes:**
- MVC-style layout: `routes/` → `controllers/` → `models/` → PostgreSQL stored procedures
- Every mutating stored procedure follows an `IN ... OUT` pattern, called via `CALL`, keeping
  business rules (uniqueness checks, stock validation, audit logging) enforced at the database
  layer, not just in JavaScript
- Database triggers automatically: bump `updated_at` timestamps, recalculate order totals when
  line items change, log every stock change to `inventory_logs` with context-aware reasons, and
  prevent stock from going negative

### Frontend

| Technology | Role in the system |
|---|---|
| **React 18** | UI library — component-based storefront and admin panel |
| **TypeScript** | Type safety across components, API responses, and shared data models |
| **Vite** | Build tool and dev server — fast HMR, production bundling |
| **Tailwind CSS** | Utility-first styling, custom design tokens (colors, fonts) for light/dark theming |
| **React Router DOM** | Client-side routing for both the storefront and the nested admin panel |
| **@vercel/blob** | Client-side direct-to-storage image uploads (product images, promo event banners) |

**Architectural notes:**
- `pages/` (route-level screens) vs `components/` (reusable pieces shared across pages) —
  mirrors the storefront/admin split
- Context providers for cross-cutting concerns: `ThemeContext` (dark/light), `AuthContext` (JWT
  session), `CartContext` (client-side cart, persisted to `localStorage`)
- `RoleRoute` wraps admin routes that need finer-grained restriction beyond "must be logged in"
- A single `lib/api.ts` fetch wrapper attaches the JWT to every request and auto-clears stale
  sessions on `401`/`403` responses

---

## 3. Deployment

The system runs across three separate managed services rather than one host, since the
frontend, backend, and database each have different hosting needs:

| Service | Hosts | Why |
|---|---|---|
| **Vercel** | Frontend (React/Vite static build) + a small serverless function (`/api/upload`) that authorizes image uploads | Optimized for static/SPA hosting and edge delivery; the one serverless function handles issuing secure, short-lived upload tokens for Vercel Blob |
| **Vercel Blob** | Product images and promo event banner images | Object storage — the browser uploads directly to Blob (bypassing the Express server for file bytes), then the resulting URL is saved to Postgres |
| **Render** | Backend (Express API) | Runs a real persistent Node.js process, which suits `pg`'s connection-pool pattern better than a serverless environment; free tier used for this project (sleeps after 15 min idle — first request after inactivity may take 30–60s) |
| **Supabase** | PostgreSQL database | Managed Postgres with a connection pooler suited to the backend's traffic pattern |

**Production URLs** *(replace with your own if redeploying)*:
- Storefront + Admin: `https://gg-gadgets.vercel.app`
- Backend API base: `https://gg-gadgets-api.onrender.com/api/v1`
- Database: Supabase project (Transaction Pooler connection string, not exposed publicly)

---

## 4. Project Structure

```
GG-Gadgets/
├── backend/
│   ├── server.js                 # Entry point — starts Express, mounts all route groups
│   ├── app.js                    # Express app setup, middleware, non-auth route mounting
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool (reads DATABASE_URL)
│   ├── controllers/               # Request handling — one file per resource
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── products.controller.js
│   │   ├── categories.controller.js
│   │   ├── customers.controller.js
│   │   ├── orders.controller.js
│   │   ├── inventory.controller.js
│   │   ├── promoEvents.controller.js
│   │   └── activityLog.controller.js
│   ├── models/                    # Database access — CALLs stored procedures
│   │   └── (one .model.js per resource, matching controllers/)
│   ├── routes/                    # Express routers — path + middleware wiring per resource
│   │   └── (one .routes.js per resource, matching controllers/)
│   ├── middleware/
│   │   ├── verifyToken.js         # JWT verification
│   │   ├── requireRole.js         # Role-based access control
│   │   ├── validationMiddleware.js
│   │   ├── validateOrder.js / validateOrderItem.js / validateOrderStatus.js
│   │   ├── validateProduct.js / validateInventoryLog.js
│   │   └── validateId.js
│   ├── scripts/                   # One-off maintenance/setup scripts
│   ├── docs/, diagrams/, reports/ # Project documentation
│   └── package.json
│
└── frontend/
    ├── index.html
    ├── vite.config.ts             # Vite config + "@/" path alias
    ├── tailwind.config.ts         # Design tokens (colors, fonts, dark mode)
    ├── vercel.json                # SPA rewrite rule (all routes → index.html)
    ├── api/
    │   └── upload.ts              # Vercel serverless function — authorizes Blob uploads via JWT
    └── src/
        ├── main.tsx                # App entry — wraps <App /> in all context providers
        ├── App.tsx                 # Route definitions (storefront + admin)
        ├── index.css                # Tailwind directives + base styles
        ├── context/
        │   ├── ThemeContext.tsx
        │   ├── AuthContext.tsx
        │   └── CartContext.tsx
        ├── lib/
        │   ├── api.ts               # Fetch wrapper — JWT attachment, error handling
        │   ├── products.ts / orders.ts / promoEvents.ts   # Resource-specific API calls
        │   └── pricing.ts           # Single source of truth for sale-price calculation
        ├── types/
        │   └── index.ts             # Shared TypeScript interfaces matching backend shapes
        ├── components/
        │   ├── ui/                  # Button, Card, Badge, Input, ThemeToggle
        │   ├── layout/              # StorefrontLayout, AdminLayout, ProtectedRoute, RoleRoute
        │   ├── storefront/          # ProductCard, EventsCarousel (shared across pages)
        │   └── admin/                # ProductImageManager
        └── pages/
            ├── storefront/           # Home, Shop, ProductDetail, Cart, TrackOrder
            └── admin/                 # Login, Dashboard, Products, Categories, Customers,
                                        # Orders, Inventory, PromoEvents, Users, StaffLogs
```

---

## 5. Setup & Commands

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local via pgAdmin, or a cloud instance like Supabase)

### Backend

```bash
cd backend
npm install               # install dependencies

# create backend/.env with:
#   DATABASE_URL=postgres://user:password@host:port/dbname
#   JWT_SECRET=your_secret_here
#   NODE_ENV=development
#   PORT=3000              # optional locally — Render sets this automatically in production

npm run dev                # start with nodemon (auto-restart on file changes)
npm start                  # start without nodemon (production-style)
```

### Frontend

```bash
cd frontend
npm install                 # install dependencies

# create frontend/.env with:
#   VITE_API_URL=http://localhost:3000/api/v1

npm run dev                  # start Vite dev server
npm run build                # production build (outputs to dist/)
npm run preview              # preview the production build locally
```

### Database

Run the consolidated schema/procedures SQL file against your PostgreSQL instance (via
pgAdmin's Query Tool or Supabase's SQL Editor) before starting the backend for the first time.
This creates all tables, triggers, and stored procedures under the `gs_schema` schema.

---

## 6. URLs & Ports (Local Development)

| Service | URL | Port |
|---|---|---|
| Backend API | `http://localhost:3000/api/v1` | `3000` |
| Frontend (Vite dev server) | `http://localhost:5173` | `5173` |
| PostgreSQL (if local) | `localhost:5432` | `5432` |

The frontend's `VITE_API_URL` must point at the backend's address — update it if the backend
runs on a different port or host.

---

## 7. Environment Variables Reference

### `backend/.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing secret for login tokens — **must match** the value used in `frontend`'s Vercel environment variables, since the upload-authorization function verifies tokens issued by this backend |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (Render injects this automatically in production) |

### `frontend/.env` (and Vercel Environment Variables)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, including `/api/v1` |
| `JWT_SECRET` | Same secret as the backend — used by `api/upload.ts` to verify a user's role before authorizing an image upload |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob's static token, required for the client-upload flow (`handleUpload`) |

---

## 8. Notable Design Decisions

- **Discounts** (flat sale price or percentage-off) and **product specifications** are stored
  in a flexible `attributes` JSONB column rather than dedicated schema columns — avoids repeated
  migrations for what are essentially optional, evolving product metadata.
- **Guest checkout & tracking**: customers don't have accounts. Checkout matches/creates a
  customer by email; order tracking requires both an order number *and* the matching email,
  intentionally more restrictive than email alone, to avoid letting anyone browse orders tied to
  an email they simply happen to know.
- **Activity logging is fire-and-forget**: a failed audit-log write never blocks or fails the
  action being logged — logging failures are caught and printed to server logs only.
- **Stock-adjustment reasons** are threaded through Postgres triggers via `set_config`/
  `current_setting`, so a single trigger can produce specific log messages ("Order item added,"
  "Order item removed (restocked)," a custom admin-entered reason) instead of one generic
  message for every stock change.