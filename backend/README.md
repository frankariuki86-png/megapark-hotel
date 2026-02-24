# Backend Setup & Dev Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file (optional):**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work fine for local dev)
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:3000`

4. **Start frontend (separate terminal):**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173` and automatically connect to backend.

## Storage

- **Default (File-based):** Data stored in `backend/data/menu.json` and `backend/data/orders.json`. No setup needed.
- **Postgres (Optional):** Set `DATABASE_URL` in `.env` to use Postgres instead. Backend will auto-detect and switch storage layers.

## API Endpoints

- `GET /api/menu` – List menu items
- `POST /api/menu` – Create menu item
- `PUT /api/menu/{id}` – Update menu item
- `DELETE /api/menu/{id}` – Delete menu item
- `GET /api/orders` – List orders
- `POST /api/orders` – Create order
- `PUT /api/orders/{id}` – Update order (status, payment status, etc.)
- `GET /api/health` – Health check

See `openapi.yaml` for full spec.

## CORS

CORS is enabled by default. Frontend can connect from any origin during dev.

## Next Steps

- Add authentication/JWT middleware
- Add input validation (Zod/Joi)
- Add database migrations (Prisma/Knex)
- Add rate-limiting and logging
- Deploy to production (Heroku, Railway, Render, etc.)
