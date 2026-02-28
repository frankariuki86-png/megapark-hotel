# MegaPark Hotel - M-Pesa Only Deployment Guide

**Status**: Production-Ready ✅  
**Date**: February 28, 2026  
**Payment Method**: M-Pesa (Mobile Payment) Only  
**Target**: Render.com Deployment

---

## Overview

This guide covers the deployment of MegaPark Hotel to Render.com with **M-Pesa as the ONLY payment method**. Stripe and PayPal have been completely removed from the codebase.

### What Changed
- ✅ Removed Stripe payment endpoints (`/api/payments/create-intent`, `/api/payments/confirm-intent`, webhook handlers)
- ✅ Removed PayPal payment option from UI  
- ✅ Simplified `PaymentGateway.jsx` to M-Pesa only
- ✅ Updated `UserProfile.jsx` to support only M-Pesa payment methods
- ✅ Simplified backend payment routes to M-Pesa only
- ✅ Updated `.env` template to remove Stripe credentials
- ✅ Frontend already built and includes M-Pesa UI

---

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Create production `.env` file with these required variables:

```bash
# Server
PORT=3000
NODE_ENV=production

# Database (PostgreSQL - REQUIRED for production)
DATABASE_URL=postgresql://user:password@host:5432/megapark_db?sslmode=require
PGSSLMODE=require

# Security
JWT_SECRET=<generate 32-char random string: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_REFRESH_SECRET=<generate 32-char random string>
JWT_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (SendGrid recommended for production)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@megapark-hotel.com
ADMIN_EMAIL=admin@megapark-hotel.com
SALES_EMAIL=sales@megapark-hotel.com
SUPPORT_EMAIL=support@megapark-hotel.com

# M-Pesa Payment (MPESA_ONLY)
MPESA_CONSUMER_KEY=your_safaricom_consumer_key
MPESA_CONSUMER_SECRET=your_safaricom_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=your_business_shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_TIMEOUT_URL=https://yourdomain.com/api/payments/mpesa/timeout

# Error Tracking (Optional but recommended)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/projectid
```

### 2. Database Setup

**Option A: Render PostgreSQL**
1. Create a PostgreSQL database on Render.com
2. Use the connection string as `DATABASE_URL`
3. Ensure `PGSSLMODE=require` is set

**Option B: External PostgreSQL (AWS RDS, Heroku, etc.)**
1. Provision a PostgreSQL database
2. Update `DATABASE_URL` to connection string
3. Ensure SSL is enabled (`?sslmode=require`)

### 3. M-Pesa Configuration

Before deploying, set up M-Pesa Daraja credentials:

1. **Register at Safaricom Daraja**: https://developer.safaricom.co.ke/
2. **Create an App** and get:
   - Consumer Key
   - Consumer Secret
   - Business Shortcode
   - Passkey (for M-Pesa Express/STK Push)
3. **Configure Callback URLs** in Daraja:
   - Callback URL: `https://yourdomain.com/api/payments/mpesa/callback`
   - Timeout URL: `https://yourdomain.com/api/payments/mpesa/timeout`

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/google/callback`
4. Download credentials and set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### 5. SendGrid Email Setup

For production email delivery:

1. Create [SendGrid account](https://sendgrid.com/)
2. Generate API Key in Settings → API Keys
3. Set `SENDGRID_API_KEY` in environment

---

## Render.com Deployment Steps

### Step 1: Prepare Repository

Ensure `.gitignore` includes:
```
.env
.env.local
.env.production
node_modules/
uploads/
dist/
```

### Step 2: Update render.yaml

The `render.yaml` file should:
- Build frontend with `npm ci && npm run build`
- Install backend with `npm ci`
- Start backend with `node backend/index.js`
- Serve frontend from `backend/index.js` at `/frontend/dist`

Current `render.yaml` (verified):
```yaml
services:
  - type: web
    name: megapark-backend
    env: node
    region: oregon
    plan: free
    repo: .
    branch: main
    buildCommand: bash -c 'npm ci --prefix frontend && npm --prefix frontend run build && npm ci --prefix backend'
    startCommand: node backend/index.js
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PGSSLMODE
        value: require

databases:
  - name: megapark-db
    plan: starter
    region: oregon
```

### Step 3: Create Render Service

1. Push code to GitHub
2. Log in to [Render.com](https://render.com/)
3. Click "+ New" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name**: `megapark-backend`
   - **Environment**: Node
   - **Build Command**: `npm ci --prefix frontend && npm --prefix frontend run build && npm ci --prefix backend`
   - **Start Command**: `node backend/index.js`
   - **Plan**: Free (or higher for production)

### Step 4: Add Environment Variables in Render Dashboard

In Render dashboard, go to your service → Environment:
- Add all variables from `.env` file
- **NEVER commit `.env` to GitHub**

### Step 5: Create PostgreSQL Database

In Render dashboard:
1. Click "+ New" → "PostgreSQL"
2. Configure database
3. Copy connection string (includes SSL)
4. Add as `DATABASE_URL` environment variable

### Step 6: Deploy

1. Render auto-deploys on push to `main` branch
2. Monitor logs for build/deployment errors
3. Check health endpoint: `https://your-render-domain.onrender.com/api/health`

---

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://yourdomain.com/api/health
# Expected response: {"ok": true, "timestamp": "...", "message": "Backend is healthy"}
```

### 2. Frontend Load
- Visit `https://yourdomain.com/`
- Should load React frontend with no console errors

### 3. M-Pesa Payment Flow
1. Browse rooms/menu
2. Proceed to checkout
3. Payment Gateway should show **M-Pesa only** option
4. Enter phone number and account name
5. Simulate M-Pesa STK Push

### 4. Admin Dashboard
- Visit `https://yourdomain.com/admin/login`
- Login with admin credentials
- Verify all features work (rooms, menus, bookings, orders)

### 5. API Endpoints
Test key endpoints:
```bash
# Health
GET /api/health

# Routes info
GET /api/routes-info

# Authentication
POST /api/auth/login
POST /api/auth/register

# Payments (M-Pesa only)
POST /api/payments/mpesa/initiate

# Menu
GET /api/menu
POST /api/menu (admin)

# Rooms
GET /api/rooms
POST /api/rooms (admin)

# Orders
POST /api/orders
GET /api/orders

# Bookings
POST /api/bookings
GET /api/bookings
```

---

## Domain & SSL Setup

### 1. Add Custom Domain
In Render dashboard:
1. Go to Service → Settings
2. Add custom domain (e.g., `megapark-hotel.com`)
3. Follow DNS instructions from Render

### 2. Update CORS_ORIGIN
Set in environment variables:
```
CORS_ORIGIN=https://megapark-hotel.com,https://www.megapark-hotel.com
```

### 3. Update M-Pesa Callback URLs
In Safaricom Daraja settings:
```
Callback: https://megapark-hotel.com/api/payments/mpesa/callback
Timeout: https://megapark-hotel.com/api/payments/mpesa/timeout
```

---

## Monitoring & Maintenance

### 1. Logs
- Render provides logs in dashboard
- Backend uses Winston/Pino for structured logging
- Check logs for errors during payment/auth flows

### 2. Error Tracking (Optional)
If using Sentry:
```
SENTRY_DSN=https://your-key@sentry.io/project
```

### 3. Database Backups
- Render PostgreSQL includes automated backups
- Set retention policy in Render dashboard

### 4. Performance
- Monitor dyno metrics in Render dashboard
- Upgrade plan if hitting limits
- Use CDN for static assets (optional)

---

## Troubleshooting

### Issue: Build Fails
**Solution**: Check logs in Render dashboard
- Missing dependencies? Run `npm install` locally
- Node version mismatch? Specify in `package.json` or `.nvmrc`

### Issue: Database Connection Error
**Solution**:
- Verify `DATABASE_URL` is correct
- Ensure `PGSSLMODE=require` is set
- Check database is running and accessible

### Issue: M-Pesa Payment Fails
**Solution**:
- Verify M-Pesa credentials in `.env`
- Check M-Pesa callback URLs are correct
- Test with Safaricom test shortcode first
- Check Daraja app is enabled

### Issue: Email Not Sent
**Solution**:
- Verify `SENDGRID_API_KEY` is correct
- Check `EMAIL_FROM` matches SendGrid verified sender
- Review SendGrid activity log

### Issue: Google Login Fails
**Solution**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check redirect URI: `https://yourdomain.com/api/auth/google/callback`
- Ensure Google OAuth is enabled in Google Cloud Console

---

## Security Best Practices

✅ **Implemented**:
- JWT-based authentication
- Bcrypt password hashing
- CORS with whitelisted origins
- Rate limiting on auth & API endpoints
- Security headers (Helmet.js)
- Input validation (Zod schemas)
- HTTPS/SSL (Render provides)
- `.env` not committed to git

⚠️ **Recommended**:
- Enable database backups
- Set up error monitoring (Sentry)
- Monitor payment logs
- Rotate JWT secrets periodically
- Use strong passwords for M-Pesa credentials
- Enable MFA on SendGrid account

---

## File Changes Summary

### Removed
- `/backend/routes/payments.js` - Stripe/PayPal endpoints removed
- `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` from `.env`
- Card/PayPal form handlers from PaymentGateway component
- Stripe service calls

### Modified
- `frontend/src/components/PaymentGateway.jsx` - Only M-Pesa form retained
- `frontend/src/components/UserProfile.jsx` - Only M-Pesa saved method support
- `backend/.env` - Removed Stripe configuration
- `render.yaml` - Already correct (builds frontend + starts backend)

### Unchanged
- Frontend build (`npm run build` produces `/frontend/dist`)
- Backend core logic (routes, middleware, services)
- Database schema
- Authentication flow

---

## Contact & Support

For issues or questions:
- **Admin Email**: admin@megapark-hotel.com
- **Support Email**: support@megapark-hotel.com
- **Safaricom Daraja**: https://developer.safaricom.co.ke/support

---

## Quick Deploy Command

```bash
# Build & test locally
npm --prefix frontend install && npm --prefix frontend run build
npm --prefix backend install && npm test --prefix backend

# Deploy to Render (auto-deploy on git push main)
git add .
git commit -m "Remove Stripe/PayPal, M-Pesa only deployment"
git push origin main
```

---

**Status**: ✅ Ready for Production Deployment  
**Last Updated**: February 28, 2026
