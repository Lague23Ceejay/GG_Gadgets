# GG Gadgets Frontend

React, TypeScript, Vite, and Tailwind-powered client for the GG Gadgets storefront and admin experience.

## What this frontend includes

- Public storefront browsing experience
- Product detail and cart flow
- Checkout form that submits customer and order data to the backend
- JWT-protected admin login and dashboard
- Admin pages for products, categories, customers, orders, and inventory
- Dark/light theme toggle with a power-switch style UI

## Project structure

```text
frontend/
├── public/                    # Static assets and public files
├── src/
│   ├── App.tsx                # Route setup and layout composition
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles and Tailwind imports
│   ├── components/
│   │   ├── layout/            # Shared storefront/admin layout wrappers
│   │   └── ui/                # Reusable UI components
│   ├── context/
│   │   ├── AuthContext.tsx    # Authentication state and token handling
│   │   ├── CartContext.tsx    # Local cart state and persistence
│   │   └── ThemeContext.tsx   # Light/dark theme toggle state
│   ├── lib/
│   │   ├── api.ts             # Typed API fetch wrapper
│   │   ├── products.ts        # Product-related frontend helpers
│   │   └── orders.ts          # Order-related frontend helpers
│   ├── pages/
│   │   ├── storefront/        # Home, product details, and cart pages
│   │   └── admin/             # Dashboard and admin CRUD pages
│   └── types/
│       └── index.ts           # Shared TypeScript interfaces and types
├── package.json               # Frontend scripts and dependencies
├── vite.config.ts            # Vite configuration and path aliases
└── tailwind.config.ts        # Tailwind CSS configuration
```

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Adjust the API URL if your backend is not running on the default port:

   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The app opens at `http://localhost:5173` by default.

## Available scripts

- `npm run dev` — launch the Vite dev server
- `npm run build` — create a production build
- `npm run preview` — preview the built app locally
- `npm run lint` — run ESLint

## Main routes

### Storefront

- `/` — homepage and product listing
- `/products/:id` — product details
- `/cart` — cart and checkout

### Admin

- `/admin/login` — admin login
- `/admin` — dashboard
- `/admin/products` — manage products
- `/admin/categories` — manage categories
- `/admin/customers` — manage customers
- `/admin/orders` — manage orders
- `/admin/inventory` — manage inventory

## API integration

The frontend uses a typed API wrapper in `src/lib/api.ts` and automatically attaches the saved JWT token from local storage when present.

## Deployment notes

This frontend is designed to be deployed on Vercel. Set the environment variable `VITE_API_URL` to the public backend URL plus `/api/v1`.

Example:

```env
VITE_API_URL=https://your-backend-url.com/api/v1
```

The backend should be hosted separately on a platform that supports a long-running Node process, such as Render, Railway, or Fly.io.

## Notes

- The theme and cart are persisted locally in the browser.
- The admin section is protected by JWT-based authentication.
