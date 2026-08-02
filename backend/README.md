# GG Gadgets API

Backend service for the GG Gadgets e-commerce platform. It provides authentication, product management, customer and order workflows, category handling, user administration, and inventory updates through a REST API.

## What this backend does

- Authenticates users with JWT
- Supports role-based access for protected endpoints
- Exposes CRUD routes for products, customers, categories, orders, users, and inventory
- Validates request payloads with Express middleware
- Stores data in PostgreSQL through the `pg` pool
- Includes Jest/Supertest coverage and Postman documentation

## Project structure

```text
backend/
├── app.js                     # Express app setup, middleware, CORS, and route mounting
├── server.js                  # Starts the HTTP server and loads the app
├── config/
│   └── db.js                  # PostgreSQL connection pool and database config
├── controllers/
│   ├── auth.controller.js     # Login, registration, and token-related logic
│   ├── products.controller.js # Product CRUD and search logic
│   ├── customers.controller.js# Customer CRUD operations
│   ├── orders.controller.js   # Order creation and order management
│   ├── categories.controller.js# Category CRUD logic
│   ├── users.controller.js    # User management endpoints
│   └── inventory.controller.js# Inventory updates and stock movements
├── models/
│   ├── products.model.js      # Product database queries
│   ├── customers.model.js     # Customer query functions
│   ├── orders.model.js        # Order and order item queries
│   ├── categories.model.js    # Category database access
│   ├── users.model.js         # User and auth query functions
│   └── inventory.model.js     # Inventory-related SQL queries
├── routes/
│   ├── auth.routes.js         # Authentication endpoints
│   ├── products.routes.js     # Product API routes
│   ├── customers.routes.js    # Customer API routes
│   ├── orders.routes.js       # Order API routes
│   ├── categories.routes.js   # Category API routes
│   ├── users.routes.js        # User API routes
│   └── inventory.routes.js    # Inventory API routes
├── middleware/
│   ├── verifyToken.js         # JWT verification middleware
│   ├── requireRole.js         # Role-based access control
│   ├── validationMiddleware.js# Shared validation response handling
│   └── validate*.js           # Request validation rules for resources
├── docs/
│   ├── db_init.sql            # Sample database initialization SQL
│   ├── gg-gadgets-api.yaml    # OpenAPI/Swagger specification
│   └── POSTMAN_README.md      # Postman usage instructions
├── tests/                     # Jest and Supertest test suites
└── package.json               # Scripts, dependencies, and project metadata
```

## Requirements

- Node.js 18+
- PostgreSQL
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in this folder using the example values:

   ```env
   DATABASE_URL=postgres://your_user:your_password@localhost:5432/your_database
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
   NODE_ENV=development
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`.

## Available scripts

- `npm start` — start the server
- `npm run dev` — start with nodemon
- `npm test` — run Jest tests with coverage
- `npm run lint` — run ESLint
- `npm run postman` — run the Postman collection and generate an HTML report

## API overview

Base URL:

```text
http://localhost:3000/api/v1
```

Main routes:

- `/auth`
- `/products`
- `/customers`
- `/categories`
- `/orders`
- `/users`
- `/inventory`

Example auth request:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourSecurePassword123"}'
```

## Generate a JWT secret

Run this in any terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Notes

- Keep environment variables private and avoid committing secrets to source control.
- Use the docs folder for API examples, SQL setup, and Postman collections.
