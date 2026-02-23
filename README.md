# 🏨 Megapark Hotel & Resort

A modern, full-stack hotel and event venue management system with integrated booking, payment processing, and food ordering capabilities.

## ✨ Features

- **Room Management** - Browse and book comfortable rooms with full details and photo gallery
- **Event Venues** - Rent multi-purpose halls for conferences, weddings, and corporate events
- **Food Ordering** - Browse authentic Kenyan cuisine menu and place food orders
- **Booking System** - Reserve rooms and halls with real-time availability
- **Payment Processing** - Secure Stripe integration for bookings and orders
- **Admin Dashboard** - Complete management system for rooms, menus, halls, bookings, and orders
- **User Authentication** - Secure JWT-based authentication with Google OAuth support
- **Photo Management** - Upload and manage photos for rooms, menus, and halls
- **Email Notifications** - Automated confirmations and updates via SendGrid
- **API Documentation** - Interactive Swagger/OpenAPI documentation
- **Error Tracking** - Sentry integration for production error monitoring

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern UI framework with functional components
- **React Router DOM 7.13.0** - Client-side routing
- **Vite 6.4.1** - Lightning-fast build tool and dev server
- **Lucide React 0.563.0** - Professional icon library

### Backend
- **Express 4.18.2** - Lightweight REST API framework
- **PostgreSQL 8.10.0** - Production-grade relational database
- **JWT Authentication** - Stateless authentication with refresh tokens
- **Stripe 14.0.0** - Payment processing
- **Nodemailer 6.9.7** - Email delivery via SendGrid
- **Multer 1.4.4** - File/photo upload handling
- **Zod 3.22.4** - Runtime schema validation
- **Sentry 10.39.0** - Error tracking and monitoring

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- PostgreSQL 12+ (optional - falls back to JSON storage)

### Setup

1. **Clone and install dependencies:**
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

2. **Environment Configuration:**
```bash
# Copy .env templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit .env files with your configuration
# See backend/.env.example for detailed variable documentation
```

3. **Database Setup (Optional):**
```bash
# If using PostgreSQL, update DATABASE_URL in backend/.env
# The app will fall back to JSON file storage if DATABASE_URL is not set
```

## 🚀 Development

### Start Frontend (Port 5175)
```bash
cd frontend
npm run dev
```

### Start Backend (Port 3000)
```bash
cd backend
npm start
```

### Access the Application
- **Frontend:** http://localhost:5175
- **API Docs:** http://localhost:3000/api/docs
- **Admin Login:** http://localhost:5175/admin/login

Default admin credentials:
- Email: `admin@megapark.com`
- Password: `admin123`

## 📚 API Documentation

Full API documentation is available at `http://localhost:3000/api/docs` (when backend is running).

### Core Endpoints
- `POST /api/auth/login` - User authentication
- `GET/POST /api/rooms` - Room CRUD operations
- `GET/POST /api/menu` - Menu item management
- `GET/POST /api/halls` - Hall/venue management
- `GET/POST /api/bookings` - Booking management
- `GET/POST /api/orders` - Food order management
- `POST /api/payments/create-intent` - Stripe payment processing

## 🧪 Testing

### Run Tests
```bash
cd backend
npm test              # Watch mode
npm run test:ui       # UI mode
npm run test:run      # Single run (CI/CD)
```

Test files are located in `backend/tests/`:
- `auth.test.js` - Authentication flows
- `menu.test.js` - Menu operations
- `orders.test.js` - Order processing
- `payment.test.js` - Payment integration

## 🚢 Deployment

### Prerequisites
- PostgreSQL database (AWS RDS, Heroku, Render, etc.)
- Stripe account with production keys
- SendGrid account for email
- Google OAuth credentials
- Domain name with DNS setup

### Quick Deploy to Render.com
See [DEPLOYMENT_ASSESSMENT.md](./DEPLOYMENT_ASSESSMENT.md) for complete deployment guide.

### Environment Variables for Production
See `backend/.env.example` for all required variables:
```
DATABASE_URL=postgresql://...
JWT_SECRET=<secure-random-key>
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CORS_ORIGIN=https://yourdomain.com
```

## 📋 Project Structure

```
megapark-hotel/
├── frontend/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API communication
│   │   ├── context/       # React context state
│   │   └── styles/        # CSS modules
│   └── package.json
│
├── backend/               # Express backend
│   ├── routes/            # API route handlers
│   ├── middleware/        # Authentication, security
│   ├── services/          # Business logic
│   ├── validators/        # Zod schemas
│   ├── tests/             # Test files
│   ├── data/              # JSON fallback storage
│   └── package.json
│
└── Documentation/         # Guides and references
    ├── DEPLOYMENT_ASSESSMENT.md
    ├── API_REFERENCE.md
    ├── DATABASE_SCHEMA.md
    └── ...
```

## 🔒 Security Features

- ✅ JWT-based authentication (stateless and scalable)
- ✅ Bcrypt password hashing
- ✅ CORS configuration with whitelisted origins
- ✅ Rate limiting (global, auth, and API-specific)
- ✅ Security headers with Helmet.js
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention
- ✅ XSS protection (React escaping)
- ✅ Request body size limits

## 📊 Admin Dashboard

Access the admin dashboard at `/admin/login` after authentication.

**Available Management Sections:**
- **Users** - Manage admin staff and user accounts
- **Rooms** - Create, edit, delete rooms with photo uploads (max 5)
- **Menu** - Manage food menu items with photos
- **Halls** - Manage event venues with amenities and photos
- **Bookings** - View and manage room reservations
- **Orders** - Track food orders and status

## 🐛 Troubleshooting

### Backend connection errors
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL is running and accessible
- Ensure JWT_SECRET is set in `.env`
- Check port 3000 is not in use

### Frontend won't connect to API
- Verify backend is running on port 3000
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS configuration in backend
- Check browser console for detailed errors

### Payment not working
- Verify Stripe keys are production keys (not test)
- Check Stripe webhook configuration
- Verify payment intent creation endpoint is accessible

## 📖 Documentation

For detailed information, see:
- [DEPLOYMENT_ASSESSMENT.md](./DEPLOYMENT_ASSESSMENT.md) - Pre-deployment checklist and guide
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure and models
- [ADMIN_DASHBOARD_READY.md](./ADMIN_DASHBOARD_READY.md) - Admin features guide
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Feature implementation details

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

For deployment or technical assistance, see DEPLOYMENT_ASSESSMENT.md or contact the development team.

---

**Current Status:** Production-Ready ✅  
**Last Updated:** 2025  
**Rating:** 7.5/10 (ready for deployment with final checklist completion)
