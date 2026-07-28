How to use the Postman collection

1. Open Postman  Import  Choose `postman-collection.json` (or `docs/postman-collection.json`).
2. Import the environment `postman-environment.json` and select it in Postman.
3. Start your server locally: `npm run dev` (default `http://localhost:3000`).
4. Use `POST /api/v1/auth/login` to obtain a token and set `{{token}}` in the environment as `Bearer <token>` or leave `{{token}}` blank if an endpoint is public.

Notes:
- All request bodies are example placeholders; adapt as your API implementation evolves.
- Endpoints use `{{base_url}}` so you can switch environments easily.
