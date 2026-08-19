# GG Gadgets

GG Gadgets is a full-stack inventory, ordering, and e-commerce system for a gadgets retailer. It includes a public React storefront and a JWT-protected administration panel for catalog, order, inventory, customer, staff, promotion, loyalty, analytics, and settings workflows.

This repository is an Advance Database project. The backend uses PostgreSQL for persistent data and exposes a REST API under `/api/v1`.

## Features

### Storefront

- Homepage with featured products and promotional events
- Product catalog with search, categories, product details, images, specifications, and sale pricing
- Cart and guest checkout with stock validation
- Guest order tracking by order number and email
- Customer order history and loyalty/rewards flows
- Responsive light and dark themes

### Administration

- Dashboard analytics
- Product, category, customer, order, and inventory management
- Inventory adjustments and activity logging
- Promotional events and homepage layout management
- Staff user management and system settings
- Barcode lookup support
- Role-based access for `super_admin`, `store_manager`, and `fulfillment_specialist`
- Product image uploads through the Vercel Blob upload endpoint

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router, Tailwind CSS, Chart.js, GSAP |
| Backend | Node.js, Express 5, ES modules, `pg`, JWT, bcryptjs, Joi, express-validator |
| Database | PostgreSQL with the `GS_schema` schema, functions, views, and constraints |
| Services | Vercel Blob uploads and optional Resend OTP email delivery |
| Testing | Jest, Supertest, Newman, ESLint |

## Repository Layout

```text
GG Gadgets/
├── backend/
│   ├── app.js                 # Express app and route registration
│   ├── server.js              # Loads configuration and starts the server
│   ├── config/db.js           # PostgreSQL connection pool
│   ├── controllers/           # HTTP request handlers
│   ├── models/                # Database access functions
│   ├── routes/                # API routers and validation wiring
│   ├── middleware/            # Authentication, roles, IDs, and payload validation
│   ├── docs/                  # OpenAPI, SQL sample, and Postman files
│   ├── diagrams/              # Generated Mermaid architecture diagram
│   ├── reports/               # Generated Postman report
│   └── routes/tests/           # Jest/Supertest route tests
├── frontend/
│   ├── api/upload.ts          # Vercel Blob upload authorization function
│   ├── src/App.tsx             # Storefront and admin route definitions
│   ├── src/components/         # Shared UI, layouts, storefront, and admin components
│   ├── src/context/            # Auth, cart, and theme state
│   ├── src/lib/                # API and domain helpers
│   ├── src/pages/              # Storefront and admin screens
│   └── src/types/              # TypeScript types
├── vercel.json                 # Optional combined Vercel deployment configuration
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/gg_gadgets
JWT_SECRET=replace_with_a_long_random_secret
PORT=3000
NODE_ENV=development
```

Optional variables:

```env
DB_SSL=true
RESEND_API_KEY=your_resend_api_key
```

`DB_SSL=true` enables PostgreSQL SSL with certificate verification disabled, which is commonly needed for hosted PostgreSQL providers. Without `RESEND_API_KEY`, OTP email sending is disabled and the backend logs a warning.

### 3. Initialize PostgreSQL

Run [`backend/docs/db_init.sql`](backend/docs/db_init.sql) against the database before starting the backend. This file creates a sample customer schema and related functions; it is not a complete schema for every feature in the application. Use the project database migration or complete schema source, if provided separately, for a full deployment.

### 4. Configure the frontend

Create `frontend/.env` from [`frontend/.env.example`](frontend/.env.example):

```env
VITE_API_URL=http://localhost:3000/api/v1
```

When `VITE_API_URL` is omitted, the frontend defaults to the same local API URL.

### 5. Start both services

In one terminal:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. The backend health check is available at `http://localhost:3000/` and returns `{ "status": "ok" }` when initialization succeeds.

## Commands

### Backend

Run these from `backend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the server with Nodemon |
| `npm start` | Start the server with Node |
| `npm test` | Run Jest and Supertest tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run postman` | Run the Newman collection and write an HTML report to `reports/postman-report.html` |

### Frontend

Run these from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Not currently defined in `frontend/package.json` |

## API

The local API base URL is:

```text
http://localhost:3000/api/v1
```

Registered route groups include:

- `/auth`
- `/products`
- `/customers`
- `/categories`
- `/orders`
- `/users`
- `/inventory`
- `/promo-events`
- `/activity-logs`
- `/settings`
- `/loyalty`
- `/analytics`

The OpenAPI specification is available at [`backend/docs/gg-gadgets-api.yaml`](backend/docs/gg-gadgets-api.yaml). Postman instructions and collections are in [`backend/docs/POSTMAN_README.md`](backend/docs/POSTMAN_README.md) and [`backend/docs/postman-collection.json`](backend/docs/postman-collection.json).

Example login request:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

## Frontend Routes

### Public

`/`, `/shop`, `/products/:id`, `/cart`, `/track-order`, and `/order-history`

### Admin

`/admin/login`, `/admin`, `/admin/products`, `/admin/categories`, `/admin/customers`, `/admin/orders`, `/admin/inventory`, `/admin/events`, `/admin/homepage-layout`, `/admin/rewards`, `/admin/staff-logs`, `/admin/users`, and `/admin/settings`

## Deployment

The repository supports these deployment pieces:

- The frontend is a Vite static build and can be deployed to Vercel.
- `frontend/vercel.json` rewrites client-side routes to `index.html` for SPA navigation.
- `frontend/api/upload.ts` authorizes Vercel Blob uploads for `super_admin` and `store_manager` users. Its deployment needs `JWT_SECRET` and the Vercel Blob token configured in Vercel.
- The backend is a long-running Express process and can be deployed to a Node-compatible service such as Render, Railway, or Fly.io.
- The root [`vercel.json`](vercel.json) contains an optional combined Vercel configuration that routes `/api` requests to the backend service and other requests to the frontend service.

For a separate frontend deployment, set `VITE_API_URL` to the deployed backend URL including `/api/v1`. Never commit `.env` files, database URLs, JWT secrets, or service tokens.

## Architecture Notes

- The backend follows a routes -> controllers -> models -> PostgreSQL flow.
- JWT authentication is enforced by middleware; role middleware restricts administrative operations.
- The frontend stores authentication, cart, and theme state in context providers. The API wrapper attaches the saved JWT to authenticated requests.
- PostgreSQL is the system of record for inventory and order data. Keep database rules and application validation aligned when changing workflows.
- `backend/scripts/generate-mermaid-diagram.js` generates `backend/diagrams/gg-gadgets-diagram.mmd` from the backend structure.

## Security Notes

- Use a long, unique `JWT_SECRET` in every environment.
- Restrict database access and use SSL for hosted PostgreSQL where required.
- Keep `RESEND_API_KEY` and Vercel Blob credentials server-side.
- The upload function validates the JWT and only grants upload tokens to permitted admin roles.
