# Deploying the backend to Render

Steps to deploy the `backend` service on Render and attach a managed Postgres database.

1. Create a new Web Service on Render
   - In the Render dashboard choose "New" → "Web Service".
   - Connect your GitHub/GitLab repo and pick the repository for this project.
   - Set the **Root Directory** to `backend`.
   - Build Command: leave blank (Render runs `npm install`) or set to `npm install`.
   - Start Command: `npm start`.

2. Add a Render Postgres database
   - In Render dashboard choose "New" → "Postgres Database".
   - Name it (e.g., `megapark-db`) and choose a plan/region.
   - After creation, attach the database to your backend service via the "Attach Database" option. Render will automatically set `DATABASE_URL` for the service.

3. Set environment variables
   - In the backend service's Environment section add:
     - `JWT_SECRET` and `JWT_REFRESH_SECRET` (use secure random values)
     - `ADMIN_EMAIL` (your admin notification email)
     - `EMAIL_*` or `SENDGRID_API_KEY` for email sending
     - `STRIPE_SECRET_KEY` and `STRIPE_PUBLIC_KEY` (if using Stripe)
     - `PGSSLMODE` = `require` (Render Postgres requires TLS)
   - `DATABASE_URL` will be set automatically if you attached the managed DB.

4. Run migrations and seed (via Shell)
   - Open the Render Web Shell for your deployed backend service and run:
     ```bash
     npm run db:setup
     ```
   - This runs the migration script and seeds initial data (if scripts exist).

5. Verify deployment
   - Open the service URL Render provides and visit `/api/health` to confirm the server is responding.
   - Use the Admin UI or automated tests to validate endpoints.

Notes
 - The backend honors `PGSSLMODE=require` and sets `ssl: { rejectUnauthorized: false }` for the pg client when required.
 - Keep secrets out of Git; set them in Render's Environment dashboard.
