# Admin Order Approval Workflow - Complete Integration Guide

## Overview
The system now supports a complete order management workflow where:
1. **Customers place orders** → Orders created with status `pending`
2. **Admin Dashboard receives orders** → Admin can view all pending orders
3. **Admin approves/manages orders** → Change status: pending → confirmed → preparing → ready → delivered
4. **Kitchen sees confirmed orders** → Kitchen staff can track order progress
5. **Admin can add/delete menu items** → Full menu management from backend

## 🔄 Complete Order Flow

### 1. Customer Places an Order
**Location:** Customer adds items to cart and checks out
**API Call:** `POST /api/orders` (via `createOrder` in mockApi)
**Status:** Automatically set to `pending` (awaiting admin approval)
**Payload:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+254712345678",
  "orderType": "delivery|dine-in|pickup",
  "deliveryAddress": "123 Main St, Nairobi",
  "items": [
    { "itemName": "Nyama Choma", "quantity": 2, "unitPrice": 850, "totalPrice": 1700 }
  ],
  "subtotal": 1700,
  "deliveryFee": 200,
  "tax": 228,
  "totalAmount": 2128,
  "status": "pending",
  "paymentStatus": "paid|pending",
  "paymentMethod": "mpesa|stripe|cash"
}
```

### 2. Order Appears in Admin Dashboard - Pending Section
**Location:** Admin Dashboard → Food Orders Tab
**What Admin Sees:**
- Order ID (e.g., `ORDER-001`)
- Customer name and phone
- Order type (delivery/dine-in)
- Items ordered with quantities and prices
- Total amount
- Payment status
- **Status badge: PENDING** (highlighted in yellow/orange)
- Status dropdown to change status

### 3. Admin Approves Order
**Action:** Admin clicks status dropdown and selects `Confirmed`
**API Call:** `PUT /api/orders/:id` with `{ status: "confirmed" }`
**Backend:** Updates order status in database
**Frontend:** Order status updates in real-time to `CONFIRMED`
**Notification:** Kitchen staff can now see this order

### 4. Kitchen Prepares Order
**Action:** Kitchen staff sees `PREPARING` status orders
**Admin Action:** Change status from `Confirmed` → `Preparing`
**Location Tracking:** Order shows "In preparation" status

### 5. Order Ready for Delivery/Service
**Action:** Kitchen marks as `READY`
**What Happens:** 
- Delivery staff notified (for delivery orders)
- Dine-in customers notified (for dine-in orders)
- Customer sees "Ready for pickup/delivery"

### 6. Order Completed
**Final Status:** `Delivered` (for delivery) or `Completed` (for dine-in)
**Archive:** Order moves to completed/archived section

## 🛠️ Admin Menu Management

### Add Menu Item
1. Go to Admin Dashboard → Menu Tab
2. Click "+ Add Menu Item"
3. Fill form:
   - Item name
   - Description
   - Category (appetizers, mains, sides, desserts, drinks)
   - Price (KES)
   - Preparation time (minutes)
   - Image (optional)
4. Click "Save Item"
5. Backend creates `POST /api/menu`
6. Item appears immediately in both frontend and backend database

### Edit Menu Item
1. In Menu Tab, click "Edit" on any item
2. Modify name, description, category, prep time, image
3. Click "Save"
4. Backend updates `PUT /api/menu/:id`
5. Changes visible throughout the site

### Delete Menu Item
1. Click "Delete" on menu item
2. Confirm deletion
3. Backend deletes `DELETE /api/menu/:id`
4. Item removed from menu and database
5. Fallback: Can select multiple items and bulk delete

### Update Menu Item Price
1. In Menu Tab, find item
2. Use "New price" input field
3. Enter new price and blur (or press Enter)
4. Backend updates `PUT /api/menu/:id` with new price
5. Price updates immediately across all menu uses

### Toggle Item Availability
1. Click "Disable" button on available items (or "Enable" for disabled)
2. Backend updates `PUT /api/menu/:id` with `{ availability: false }`
3. Item grayed out on customer menu (if implemented in frontend)

## 🔐 Admin Authentication

### Login
1. Go to `/admin/login`
2. Enter email and password
3. **Backend Credentials:** 
   - Email: `admin@megapark.com`
   - Password: `admin123`
4. Frontend calls `POST /api/auth/login` (via `loginAdmin` in mockApi)
5. Backend validates and returns:
   ```json
   {
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc...",
     "user": {
       "id": "admin-001",
       "email": "admin@megapark.com",
       "name": "Admin User",
       "role": "admin"
     }
   }
   ```
6. Tokens stored in localStorage
7. Admin redirected to Dashboard

### Token Management
- **Access Token:** Expires in 15 minutes
- **Refresh Token:** Expires in 7 days
- **Auto-refresh:** When access token expires, refresh token used to get new one
- **API Calls:** All authenticated endpoints include `Authorization: Bearer {token}`

### Logout
1. Click "Logout" button in Admin Dashboard
2. Tokens cleared from localStorage
3. Redirected to login page
4. Backend `/api/auth/logout` called

## 📊 API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Admin logout

### Menu Management (Protected)
- `GET /api/menu` - List all menu items (public)
- `POST /api/menu` - Create menu item (protected)
- `PUT /api/menu/:id` - Update menu item (protected)
- `DELETE /api/menu/:id` - Delete menu item (protected)

### Order Management
- `GET /api/orders` - List all orders (protected)
- `POST /api/orders` - Create order (public, no auth required)
- `PUT /api/orders/:id` - Update order status (protected)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-intent` - Confirm Stripe payment
- `GET /api/payments/intent/:id` - Get payment intent status
- `POST /api/payments/mpesa/initiate` - Initiate M-Pesa STK Push

## 🚀 Testing the Complete Flow

### Test Scenario: Customer Order → Admin Approval

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Expected: Server running on http://localhost:3000

2. **Start Frontend Server**
   ```bash
   # In project root
   npm run dev
   ```
   Expected: Frontend running on http://localhost:5173

3. **Customer Steps:**
   - Visit http://localhost:5173
   - Browse menu
   - Add items to cart: "Nyama Choma" (qty: 2), "Chapati" (qty: 2)
   - Click "Checkout"
   - Fill customer details:
     - Name: "Test Customer"
     - Email: "customer@test.com"
     - Phone: "+254712345678"
     - Order Type: "delivery" or "dine-in"
     - If delivery: Address "123 Test St, Nairobi"
   - Select payment method: M-Pesa, Stripe, or Cash
   - Click "Place Order"
   - You should see: "Order created successfully" or confirmation screen

4. **Admin Steps:**
   - Open new tab: http://localhost:5173/admin/login
   - Login with:
     - Email: `admin@megapark.com`
     - Password: `admin123`
   - Click "Food Orders" tab
   - Should see your test order with status `PENDING`
   - Click status dropdown and change to `CONFIRMED`
   - Observe:
     - Status updates to `CONFIRMED`
     - Order moves to confirmed section
     - Success toast appears

5. **Continue Flow:**
   - Change status: CONFIRMED → PREPARING
   - Change status: PREPARING → READY
   - Change status: READY → DELIVERED
   - Observe order moves through workflow

### Test Scenario: Admin Menu Management

1. **Add New Menu Item:**
   - In Admin Dashboard, go to Menu tab
   - Click "+ Add Menu Item"
   - Fill:
     - Name: "Test Dish"
     - Description: "A delicious test dish"
     - Category: "mains"
     - Price: "1200"
     - Prep Time: "20"
   - Click "Save Item"
   - Expected: New item appears in menu grid
   - Check database: Item saved in backend

2. **Edit Menu Item:**
   - Find any item in menu grid
   - Click "Edit"
   - Change price to "1500"
   - Click "Save"
   - Expected: Price updates immediately

3. **Delete Menu Item:**
   - Click "Delete" on the test dish
   - Confirm deletion
   - Expected: Item removed from menu

4. **Update Price Directly:**
   - Find menu item
   - Use "New price" input field
   - Enter "800" and press Enter
   - Expected: Price updates without opening edit modal

## 🐛 Troubleshooting

### Issue: Orders not appearing in admin dashboard
**Solution:**
- Verify backend is running on port 3000
- Check browser console for API errors
- Ensure admin is logged in with valid token
- Check token in localStorage: `__megapark_jwt__`

### Issue: "Unauthorized" errors when updating orders
**Solution:**
- Admin token may have expired
- Re-login to get fresh tokens
- Check that `Authorization: Bearer {token}` header is being sent
- Verify JWT_SECRET on backend matches token

### Issue: Menu items not saving to backend
**Solution:**
- Ensure you're logged in as admin (menu operations are protected)
- Check network tab in DevTools for POST/PUT errors
- Verify backend has write access to database

### Issue: No database persistence
**Solution:**
- If using file-backed JSON: check `backend/data/` directory
- If using Postgres: set `DATABASE_URL` environment variable
- Run `npm run migrate` to create tables
- Run `npm run seed` to populate sample data

## 📝 Environment Variables Required

### Backend (.env file in `backend/` directory)
```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
DATABASE_URL=postgres://user:password@localhost/megapark  # Optional

# For M-Pesa
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=123456
MPESA_PASSKEY=your-passkey

# For Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# For Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## ✅ Integration Status

- ✅ Admin login uses real backend API
- ✅ Customer orders sent to backend with status `pending`
- ✅ Admin dashboard displays pending orders
- ✅ Admin can update order status (pending → confirmed → preparing → ready → delivered)
- ✅ Menu items fully manageable from admin dashboard
- ✅ Add/Edit/Delete/Price update operations connected to backend
- ✅ JWT authentication enabled for protected endpoints
- ✅ Orders include customer details, items, totals, and payment info
- ✅ M-Pesa payment initiation endpoint available
- ✅ Stripe payment integration ready
- ✅ Email notifications on order creation

## 📈 Next Steps

Optional enhancements:
- Integrate with actual Postgres database for production
- Add real M-Pesa/Daraja implementation
- Add SMS notifications to admin when new orders received
- Add kitchen display system (KDS) for order tracking
- Add order timing/SLA management
- Add bulk order imports/exports
- Add order analytics and reporting
- Add role-based access control (staff, kitchen, delivery)
