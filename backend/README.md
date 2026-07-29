# GetGood (GG) Gadgets API

Backend API for GG Gadgets, an e-commerce system for managing products, customers, orders, users, categories, and inventory.

## Features

- JWT-based authentication and authorization
- Role-based access control for protected resources
- CRUD operations for products, customers, categories, orders, users, and inventory
- Request validation using Express middleware
- PostgreSQL database integration via `pg`
- Automated tests with Jest and Supertest
- Postman collections and API documentation included

## Backend structure

- `app.js` — main Express application setup, middleware, and route registration
- `server.js` — starts the HTTP server and loads environment variables
- `.env.example` — example environment variables for local setup
- `package.json` — project metadata, scripts, dependencies, and dev dependencies
- `eslint.config.cjs` — ESLint rules and configuration
- `test_mod.mjs` — custom test module helper used in test setup
- `test_server.js` — helper for server tests and integration testing

### config/
- `db.js` — PostgreSQL database connection configuration and pool setup

### controllers/
- `auth.controller.js` — login, signup, and token-related request handlers
- `categories.controller.js` — category resource handlers and business logic
- `customers.controller.js` — customer CRUD handlers and operations
- `inventory.controller.js` — inventory log handling and stock management
- `orders.controller.js` — order creation, updates, and retrieval logic
- `products.controller.js` — product CRUD handlers and search/filter logic
- `users.controller.js` — user management and account operations

### models/
- `categories.model.js` — database queries for categories
- `customers.model.js` — customer-related SQL operations
- `inventory.model.js` — inventory and stock query implementations
- `orders.model.js` — order and order item database access
- `products.model.js` — product query and persistence functions
- `users.model.js` — user query and authentication data access

### routes/
- `auth.routes.js` — authentication and token routes
- `categories.routes.js` — category endpoints
- `customers.routes.js` — customer endpoints
- `inventory.routes.js` — inventory endpoints
- `orders.routes.js` — order endpoints
- `products.routes.js` — product endpoints
- `users.routes.js` — user endpoints
- `tests/` — route and controller test files for Jest and Supertest

### middleware/
- `auth.Middleware.js` — authentication helpers and protected route support
- `requireRole.js` — role-based authorization middleware
- `validateId.js` — ID parameter validation middleware
- `validateInventoryLog.js` — inventory log validation for requests
- `validateOrder.js` — order request body validation
- `validateOrderItem.js` — validation for order item payloads
- `validateOrderStatus.js` — order status update validation
- `validateProduct.js` — product request validation rules
- `validationMiddleware.js` — generic validation result handling
- `verifyToken.js` — JWT token verification middleware

### docs/
- `db_init.sql` — sample database initialization SQL script
- `gg-gadgets-api.yaml` — OpenAPI/Swagger API specification
- `postman-collection.json` — exported Postman collection for API testing
- `test.postman_collection.json` — additional Postman collection for tests
- `tmp-collection.json` — temporary Postman export file
- `POSTMAN_README.md` — instructions for using Postman with this API

### coverage/
- generated code coverage reports from Jest test runs

### diagrams/
- `gg-gadgets-diagram.mmd` — Mermaid diagram source for system architecture or entity flow

### reports/
- `postman-report.html` — generated HTML report from Newman/Postman runs

## Requirements

- Node.js 18 or newer
- PostgreSQL database
- npm

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with values like:
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

## Available scripts

- `npm start` — start the server
- `npm run dev` — start the server with nodemon
- `npm test` — run Jest tests with coverage
- `npm run lint` — run ESLint
- `npm run postman` — run Newman collection and generate HTML report

## API base URL

Local server:

`http://localhost:3000`

curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"yourSecurePassword123\",\"role\":\"admin\"}"


Main API routes:

- `/api/v1/auth`
- `/api/v1/products`
- `/api/v1/customers`
- `/api/v1/categories`
- `/api/v1/orders`
- `/api/v1/users`
- `/api/v1/inventory`

## Notes

- Keep `.env` private and never commit secrets to source control.
- Use the `docs/` folder for API specs, Postman collections, and test documentation.
