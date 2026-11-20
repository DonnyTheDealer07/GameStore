# NEONBYTE

NEONBYTE is a gaming storefront with a React/Vite frontend in `frontend/` and an Express/Mongoose API in `backend/`. MongoDB stores the product catalog. The cart, wishlist, and checkout demonstration run in the browser.

## Local development

Use Node.js 22.12 or newer. Install both projects from the repository root.

```sh
npm ci --prefix backend
npm ci --prefix frontend
```

Copy `backend/.env.example` to `backend/.env`. Set `MONGODB_URI` to your server-side MongoDB connection string, and confirm `MONGODB_DB` points to the intended catalog database.

For the first catalog import into an empty database, run `npm --prefix backend run seed -- --apply`. The import inserts missing original products, preserves matching records, and stops if it encounters different product identities. API startup never runs the import.

Run `npm run dev:api` and `npm run dev` in separate terminals. Vite proxies `/api` to port 5000. If the API runs elsewhere, set `VITE_API_URL` in `frontend/.env` and include the frontend origin in `FRONTEND_ORIGINS`.

Run `npm run build` for the frontend production build and `npm run lint` for frontend linting. Run `npm test` for the API validation and middleware tests. With a separate test API running against a seeded test database, set `NEONBYTE_TEST_API_URL` to its base URL to include the database-backed API checks.

## API

| Method and path | Description |
| --- | --- |
| `GET /api/health` | API readiness and MongoDB ping |
| `GET /api/products` | Catalog with `q`, `category`, `collection`, `min`, `max`, `sort`, `page`, and `limit` |
| `GET /api/products/featured` | Featured products for the homepage |
| `GET /api/products/:slug` | Product and related products |
| `GET /api/categories` | Category IDs, names, and descriptions |

The product list accepts `featured`, `price-asc`, `price-desc`, `newest`, or `rating` for sorting. It also accepts up to 100 comma-separated `ids` to restore saved carts and wishlists. Prices are in South African rand.

## Hosting

- Render uses `backend/` with `npm ci`, `npm start`, and the `/api/health` health check. The root `render.yaml` describes the web service. Store `MONGODB_URI` as a Render secret and use the intended `MONGODB_DB`. Atlas must permit the service's outbound addresses.
- Vercel uses `frontend/`, the Vite framework preset, `npm run build`, and the `dist` output. Set `VITE_API_URL` to the Render service origin and set Render's `FRONTEND_ORIGINS` to the exact Vercel origin. `frontend/vercel.json` serves static files first and falls back to React Router for deep links.
- Images and video ship with the frontend. An optional `VITE_MEDIA_URL` can point to a CDN that mirrors the public media paths. The API serves product URLs and metadata. Set only public configuration in Vite environment variables.

Checkout remains a demonstration. It validates sample shipping information and creates a local confirmation without processing a payment or storing customer details on the server.
