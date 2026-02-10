# Quick Start - Admin Order Management System

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 16+
- npm or yarn
- SQLite (default) or PostgreSQL (optional)

### Step 1: Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Setup Environment Variables (Optional)

Backend `.backend/.env` (create this file):
```env
JWT_SECRET=mega-park-secret-key-change-in-production
JWT_REFRESH_SECRET=mega-park-refresh-secret-change-in-production
PORT=3000
NODE_ENV=development
```

### Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✓ Backend running on http://localhost:3000
✓ API docs: http://localhost:3000/api/docs

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✓ Frontend running on http://localhost:5173

### Step 4: Access the System

**Customer Menu:**
- http://localhost:5173 (Browse menu, add to cart)

**Admin Dashboard:**
- http://localhost:5173/admin/login
- Email: `admin@megapark.com`
- Password: `admin123` ✓ (Fixed - now working)

---

## 📋 Complete Admin Order Flow

### 1️⃣ Customer Places Order
1. Visit http://localhost:5173
2. Browse menu items
3. Click "Make order" to add items to cart
4. Go to Cart (top right icon)
5. Click "Checkout"
6. Fill details:
   - Name: Your name
   - Email: your@email.com  
   - Phone: +2547...
   - Order Type: Dine-in or Delivery
   - If delivery: Add address
7. Select payment method (Cash/M-Pesa/Stripe)
8. Click "Place Order"
9. ✓ Order created with status **PENDING**

### 2️⃣ Admin Reviews Pending Orders
1. Open http://localhost:5173/admin/login
2. Enter credentials (see above)
3. Go to "Food Orders" tab
4. You'll see your order with:
   - Order ID
   - Customer name & phone
   - Items ordered
   - Total amount
   - Status: **PENDING** (yellow badge)

### 3️⃣ Admin Approves Order
1. Find the pending order
2. Click dropdown where it says "PENDING"
3. Select "CONFIRMED"
4. ✓ Order status updated to **CONFIRMED**
5. Order ready for kitchen

### 4️⃣ Kitchen Prepares Order
1. Kitchen staff see confirmed orders
2. When cooking starts, admin changes status to "PREPARING"
3. Status updates in real-time

### 5️⃣ Order Ready
1. Admin changes status to "READY"
2. For dine-in: Customer notified to collect
3. For delivery: Delivery staff notified

### 6️⃣ Order Delivered/Completed
1. Admin changes status to "DELIVERED"
2. Order archived

---

## 🛠️ Admin Menu Management Features

### Add Menu Item
```
Admin Dashboard → Menu Tab → "+ Add Menu Item"
```
Fill in these fields:
- **Name:** Item name (e.g., "Nyama Choma")
- **Description:** What is it (e.g., "Grilled meat with vegetables")
- **Category:** Choose from dropdown (Appetizers, Mains, Sides, Desserts, Drinks)
- **Price:** Amount in KES
- **Prep Time:** Minutes to prepare
- **Image:** Upload or paste URL (optional)

Click **"Save Item"** → Item appears in menu immediately

### Edit Menu Item
1. Find item in menu grid
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Save"**

### Delete Menu Item
1. Click **"Delete"** button
2. Confirm deletion
3. Item removed from menu and database

### Update Price Only
1. Find price input field on menu item
2. Enter new price
3. Press Enter or click away
4. Price updates instantly

### Bulk Operations
- **Select multiple items:** Check boxes on menu items
- **Select all on page:** Click "Select Page" button
- **Bulk delete:** Select items, click "Bulk Delete"
- **Clear selection:** Click "Clear" button

---

## 📊 Admin Dashboard Overview

### Tabs Available
1. **Overview** - Statistics and recent bookings
2. **Rooms** - Room management  
3. **Bookings** - Booking requests
4. **Events** - Event bookings
5. **Menu** - Menu items management ⭐
6. **Food Orders** - Order management ⭐

### Key Features
✅ Search/filter orders and menu items
✅ Export to CSV
✅ Real-time status updates
✅ Order history and tracking
✅ Payment status monitoring
✅ Bulk operations

---

## 🔐 Admin Login Details

| Field | Value |
|-------|-------|
| **Email** | admin@megapark.com |
| **Password** | admin123 |
| **Role** | Admin |

Once logged in:
- ✓ JWT token stored in browser
- ✓ Auto-refreshes when expired
- ✓ Click "Logout" to sign out

---

## 🧪 Complete Test Scenario

### Test 1: Create and Approve Order (3 mins)
```
1. [CUSTOMER] Add "Nyama Choma" (qty: 2) to cart
2. [CUSTOMER] Add "Chapati" (qty: 2) to cart
3. [CUSTOMER] Checkout with:
   - Name: "Test User"
   - Email: "test@test.com"
   - Type: "Dine-in"
   - Payment: "Cash"
4. [CUSTOMER] Order created (see confirmation)
5. [ADMIN] Login to dashboard
6. [ADMIN] Go to Orders tab
7. [ADMIN] Find order with PENDING status
8. [ADMIN] Change status to CONFIRMED
9. [ADMIN] Verify status updated
```

### Test 2: Manage Menu (2 mins)
```
1. [ADMIN] Go to Menu tab
2. [ADMIN] Click "+ Add Menu Item"
3. [ADMIN] Create item:
   - Name: "Ugali Supreme"
   - Category: "Mains"
   - Price: 500
   - Prep: 15 mins
4. [ADMIN] Save Item
5. [ADMIN] Find item in menu grid
6. [ADMIN] Change price via "New price" input (e.g., 550)
7. [ADMIN] Delete the test item
```

### Test 3: Multiple Orders (5 mins)
```
1. [CUSTOMER] Place 3 different orders
2. [ADMIN] View all in Orders tab
3. [ADMIN] Approve order 1 (CONFIRMED)
4. [ADMIN] Change order 2 to PREPARING
5. [ADMIN] Change order 3 to READY
6. Observe status filtering in dashboard
```

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Cannot connect to backend" error
- Verify backend is running on http://localhost:3000
- Check firewall isn't blocking port 3000
- Try: `curl http://localhost:3000/api/health`

### Orders not appearing in admin dashboard
- Refresh the page (Ctrl+R)
- Check admin is logged in
- Check browser console for errors (F12)
- Verify JWT token: `localStorage.getItem('__megapark_jwt__')`

### Menu changes not saving
- Verify admin is logged in (protected endpoint)
- Check network tab in DevTools for 401/403 errors
- Re-login if token expired

### "Validation error" messages
- Fill all required fields (marked with *)
- Use correct data types:
  - Price: numbers only (e.g., 850)
  - Prep time: numbers only (e.g., 15)

---

## 📱 API Endpoints Quick Reference

### Creating Orders (Customer)
```
POST /api/orders
Body: {
  "customerName": "John",
  "customerEmail": "john@email.com",
  "items": [...],
  "totalAmount": 2500,
  ...
}
Response: Created order with ID and status: "pending"
```

### Getting Orders (Admin)
```
GET /api/orders
Headers: Authorization: Bearer {token}
Response: Array of all orders
```

### Updating Order Status (Admin)
```
PUT /api/orders/:id
Body: { "status": "confirmed" }
Headers: Authorization: Bearer {token}
Response: Updated order object
```

### Managing Menu (Admin)
```
POST /api/menu          → Create item
PUT /api/menu/:id       → Update item
DELETE /api/menu/:id    → Delete item
Headers: Authorization: Bearer {token}
```

---

## 📈 What's Working Now

✅ Customer places order → Sent to backend
✅ Order status defaults to "pending"
✅ Admin login with JWT authentication
✅ Admin views pending orders
✅ Admin can approve/change order status
✅ Menu items fully manageable
✅ Add new menu items to database
✅ Delete menu items
✅ Update prices
✅ Real-time UI updates
✅ Bulk menu operations

---

## 🎯 Key Workflow Sequence

```
┌─────────────────────────────────────────┐
│   CUSTOMER JOURNEY                      │
├─────────────────────────────────────────┤
│ 1. Browse menu                          │
│ 2. Add items to cart                    │
│ 3. Checkout                             │
│ 4. Fill details                         │
│ 5. Place order                          │
│ 6. Order created (status: PENDING)      │
│ 7. Await admin approval                 │
│ 8. Order confirmed → Ready for prep     │
│ 9. Notified when ready                  │
│ 10. Pickup/Delivery                     │
└─────────────────────────────────────────┘
           ⬇️
┌─────────────────────────────────────────┐
│   ADMIN DASHBOARD                       │
├─────────────────────────────────────────┤
│ 1. View pending orders                  │
│ 2. Click order to expand details        │
│ 3. Review items & total                 │
│ 4. Change status to CONFIRMED           │
│ 5. Kitchen starts preparation           │
│ 6. Update to PREPARING                  │
│ 7. Update to READY                      │
│ 8. Update to DELIVERED                  │
└─────────────────────────────────────────┘
           ⬇️
┌─────────────────────────────────────────┐
│   MENU MANAGEMENT                       │
├─────────────────────────────────────────┤
│ 1. Add new items                        │
│ 2. Edit descriptions & categories       │
│ 3. Update prices                        │
│ 4. Disable availability                 │
│ 5. Delete items                         │
│ 6. Bulk operations                      │
│ 7. Export menu as CSV                   │
└─────────────────────────────────────────┘
```

---

## 💡 Pro Tips

- **Use Ctrl+F** to search menu items
- **Use Ctrl+N** to toggle add menu form
- **Use Ctrl+E** to export menu as CSV
- **Bulk delete:** Select items, click "Bulk Delete"
- **Sort menu:** By name or price
- **Pagination:** Choose 4/8/12 items per page
- **Status flow:** pending → confirmed → preparing → ready → delivered

---

## ✨ System is Ready!

All pieces are connected and working:
1. ✅ Frontend forms submit to backend APIs
2. ✅ Authentication with JWT tokens
3. ✅ Orders stored in backend database
4. ✅ Admin can control entire workflow
5. ✅ Real-time UI updates
6. ✅ Error handling and validation

**Ready to use for real operations!**
