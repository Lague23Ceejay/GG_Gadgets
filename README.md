# GG Gadgets

GG Gadgets is a full-stack e-commerce web application for managing and browsing gadgets online. The project combines a React + TypeScript storefront with an Express + PostgreSQL backend to support product browsing, cart checkout, admin inventory management, customer order handling, and authentication.

This repository is organized as two main parts:

- Frontend: a modern React-based storefront and admin dashboard
- Backend: a REST API for product, customer, order, user, category, and inventory management

## Project overview

GG Gadgets is designed to provide:

- A public storefront where customers can browse products, view details, and place orders
- A cart and checkout experience for customers
- An admin panel for managing products, categories, customers, orders, and inventory
- Secure authentication using JWTs and role-based access control
- A PostgreSQL-backed data layer with validation and API documentation

## Main features

### Frontend features

- Responsive storefront UI
- Product listing and product detail pages
- Cart and checkout flow
- Admin login and protected admin routes
- Admin pages for managing products, categories, customers, orders, and inventory
- Theme toggle with light/dark mode
- API integration through typed frontend helpers

### Backend features

- RESTful API endpoints for core business operations
- JWT-based authentication and authorization
- Role-based access control for admin operations
- Request validation middleware
- PostgreSQL database integration
- Product and order management workflows
- Test coverage with Jest and Supertest
- Postman and OpenAPI documentation support

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Vercel Blob client for image uploads

### Backend

- Node.js
- Express.js
- PostgreSQL
- pg
- JWT (jsonwebtoken)
- bcryptjs
- express-validator / Joi
- Jest + Supertest
- Nodemon
- ESLint

## Project structure

```text
GG Gadgets/
├── backend/                   # Express.js backend API
│   ├── app.js                 # Main Express app setup and route mounting
│   ├── server.js              # Server bootstrap and startup entry point
│   ├── config/
│   │   └── db.js              # PostgreSQL connection pool setup
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── categories.controller.js
│   │   ├── customers.controller.js
│   │   ├── inventory.controller.js
│   │   ├── orders.controller.js
│   │   ├── products.controller.js
│   │   └── users.controller.js
│   ├── models/
│   │   ├── categories.model.js
│   │   ├── customers.model.js
│   │   ├── inventory.model.js
│   │   ├── orders.model.js
│   │   ├── products.model.js
│   │   └── users.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── categories.routes.js
│   │   ├── customers.routes.js
│   │   ├── inventory.routes.js
│   │   ├── orders.routes.js
│   │   ├── products.routes.js
│   │   └── users.routes.js
│   ├── middleware/
│   │   ├── auth.Middleware.js
│   │   ├── requireRole.js
│   │   ├── validateId.js
│   │   ├── validateInventoryLog.js
│   │   ├── validateOrder.js
│   │   ├── validateOrderItem.js
│   │   ├── validateOrderStatus.js
│   │   ├── validateProduct.js
│   │   ├── validationMiddleware.js
│   │   └── verifyToken.js
│   ├── docs/
│   │   ├── db_init.sql
│   │   ├── gg-gadgets-api.yaml
│   │   ├── POSTMAN_README.md
│   │   ├── postman-collection.json
│   │   └── test.postman_collection.json
│   ├── routes/tests/
│   │   ├── customers.test.js
│   │   ├── param-validation.test.js
│   │   └── products.test.js
│   ├── coverage/              # Generated test coverage reports
│   ├── reports/               # Postman/reporting output
│   ├── diagrams/              # Mermaid diagram files
│   └── package.json           # Backend scripts and dependencies
│
├── frontend/                  # React + TypeScript frontend app
│   ├── api/
│   │   └── upload.ts          # Vercel Blob upload handler for image uploads
│   ├── public/                # Static public assets
│   ├── src/
│   │   ├── App.tsx            # Main route setup and layout composition
│   │   ├── main.tsx           # Frontend entry point
│   │   ├── index.css          # Global styles and Tailwind base styles
│   │   ├── components/
│   │   │   ├── layout/        # Shared storefront/admin layout components
│   │   │   └── ui/            # Reusable button/input/card components
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── CartContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/
│   │   │   ├── api.ts         # Shared API wrapper with auth headers
│   │   │   ├── products.ts    # Product-related frontend helpers
│   │   │   └── orders.ts      # Order-related frontend helpers
│   │   ├── pages/
│   │   │   ├── admin/         # Dashboard, login, products, orders, inventory, etc.
│   │   │   └── storefront/   # Home, product details, cart, and shop pages
│   │   └── types/
│   │       └── index.ts       # Shared TypeScript interfaces and types
│   ├── package.json           # Frontend scripts and dependencies
│   ├── vite.config.ts        # Vite configuration and alias setup
│   ├── tailwind.config.ts    # Tailwind CSS configuration
│   └── vercel.json            # Vercel routing configuration
│
└── README.md                  # Master project overview (this file)
```

## Frontend workflow

The frontend is responsible for:

- Rendering the storefront experience
- Calling backend APIs for products, orders, customers, and auth
- Managing local UI state such as cart and theme
- Protecting admin routes with JWT-based authentication
- Uploading product images through the Vercel Blob integration

## Backend workflow

The backend is responsible for:

- Exposing the REST API for the frontend
- Handling business logic for products, customers, orders, categories, users, and inventory
- Validating incoming requests
- Checking authorization for protected actions
- Storing and retrieving data from PostgreSQL

## Setup summary

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment notes

- The backend uses environment variables such as `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `NODE_ENV`
- The frontend uses `VITE_API_URL` to connect to the backend API
- Keep secrets private and avoid committing `.env` files to version control

## Notes

- The backend README and frontend README remain separate for focused setup and development guidance.
- This master README is intended as a project-level overview for the full application.
