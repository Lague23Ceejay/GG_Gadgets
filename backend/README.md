# GetGood(GG) Gadgets API

Backend API for GG Gadgets, an e-commerce system for managing products, customers, orders, users, categories, and inventory.

## Features

- Authentication and authorization with JWT
- Role-based access control for protected routes
- CRUD operations for products, customers, categories, orders, users, and inventory
- Request validation and middleware-based security checks
- PostgreSQL database integration using Node.js
- API documentation and Postman collections in the docs folder

## Project structure

- app.js: application bootstrap and route mounting
- server.js: starts the server
- config/: database configuration
- controllers/: request handlers and business logic
- models/: database queries and data access
- routes/: API endpoint definitions
- middleware/: authentication, validation, and authorization logic
- docs/: API specs and test collections
- tests/: Jest and Supertest test files

## Requirements

- Node.js 18 or newer
- PostgreSQL database
- npm

## Setup

1. Install dependencies:
   npm install

2. Create a .env file in the project root with the following values:

   DATABASE_URL=postgres://your_user:your_password@localhost:5432/your_database
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
   NODE_ENV=development

3. Start the development server:
   npm run dev

## Available scripts

- npm start: start the server
- npm run dev: start the server with nodemon
- npm test: run the test suite
- npm run lint: run ESLint
- npm run postman: run the Postman collection export/report

## API base URL

The server runs locally at:

http://localhost:3000

Main API routes:

- /api/v1/auth
- /api/v1/products
- /api/v1/customers
- /api/v1/categories
- /api/v1/orders
- /api/v1/users
- /api/v1/inventory

## Notes

- Keep your .env file private and do not commit sensitive credentials to Git.
- The project includes documentation and test assets under the docs and tests folders.
