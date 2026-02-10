# 📊 Visual Quick Reference - Admin Order Management

## 🎯 System at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    MEGA PARK HOTEL                          │
│              Admin Order & Menu Management                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│   CUSTOMER PORTAL    │      │   ADMIN DASHBOARD    │
│                      │      │                      │
│ • Browse Menu        │      │ • Login              │
│ • Add to Cart        │      │ • View Orders        │
│ • Checkout           │      │ • Approve Orders     │
│ • Place Order        │      │ • Manage Menu        │
│ • Track Status       │      │ • Update Prices      │
│                      │      │ • View Reports       │
└──────────┬───────────┘      └─────────┬───────────┘
           │                             │
           │ HTTP API                    │ JWT Auth
           │ JSON                        │
           └──────────────┬──────────────┘
                          │
                   ┌──────▼──────┐
                   │   BACKEND   │
                   │   Express   │
                   └──────┬──────┘
                          │
                    ┌─────▼─────┐
                    │ DATABASE  │
                    │ Postgres/ │
                    │   JSON    │
                    └───────────┘
```

---

## 🔄 Order Journey (Visual)

```
STEP 1: CUSTOMER ORDERS
┌─────────────────────────────────────┐
│ Customer browses menu               │
│ Adds: Nyama Choma × 2, Chapati × 3 │
│ Clicks: Checkout                    │
│ Fills: Name, Email, Phone, Address  │
│ Selects: Payment Method             │
│ Clicks: Place Order                 │
└──────────────┬──────────────────────┘
               │
               ▼
        POST /api/orders
        
STEP 2: ORDER CREATED (PENDING)
┌─────────────────────────────────────┐
│ Backend receives order              │
│ Validates data                      │
│ Sets: status = "pending"            │
│ Saves to: Database                  │
│ Returns: Order ID + Confirmation    │
└──────────────┬──────────────────────┘
               │
               ▼
        Customer sees:
        "Order Created! Awaiting admin approval"
        Status: PENDING (yellow)

STEP 3: ADMIN SEES ORDER
┌─────────────────────────────────────┐
│ Admin logs in                       │
│ Views: Food Orders Dashboard        │
│ Sees: Pending orders (yellow badge) │
│ Clicks: Dropdown menu               │
└──────────────┬──────────────────────┘
               │
               ▼
        Admin selects: CONFIRMED

STEP 4: ORDER APPROVED
┌─────────────────────────────────────┐
│ Backend updates order               │
│ Sets: status = "confirmed"          │
│ Saves to: Database                  │
│ Returns: Updated order              │
└──────────────┬──────────────────────┘
               │
               ▼
        PUT /api/orders/ORDER-123
        {status: "confirmed"}
        
STEP 5: ORDER READY FOR KITCHEN
┌─────────────────────────────────────┐
│ Admin: CONFIRMED (green)            │
│ Kitchen sees: New confirmed order   │
│ Kitchen starts: Preparing food      │
│ Admin updates: → PREPARING          │
│ Kitchen updates: → READY            │
│ Delivery picks up                   │
│ Admin updates: → DELIVERED          │
└─────────────────────────────────────┘
```

---

## 📱 Admin Dashboard Layout

```
╔═══════════════════════════════════════════════════════════════╗
║                     ADMIN DASHBOARD                           ║
║  Welcome, Admin User                              [Logout]    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  [Overview] [Rooms] [Bookings] [Events] [Menu] [Orders] ◄─── ║
║                                                               ║
║  ▼ FOOD ORDERS TAB SELECTED                                  ║
║                                                               ║
║  Total Orders: 5    Pending: 2    Preparing: 1  Ready: 2    ║
║                                                               ║
║  Search: [Order name or ID....... ]                          ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Order ID          Customer       Status      Total       │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │ ORDER-001         John Doe      PENDING     2,500 KES    │ ║
║  │                                  ^                        │ ║
║  │                              [dropdown] ──┐              │ ║
║  │                                    confirmed │              │ ║
║  │                                    preparing │              │ ║
║  │                                    ready ────┘              │ ║
║  │                                                             │ ║
║  │ ORDER-002         Sarah Smith    PREPARING  3,200 KES    │ ║
║  │                                  [dropdown]                │ ║
║  │                                                             │ ║
║  │ ORDER-003         Mike Brown     READY      1,800 KES    │ ║
║  │                                  [dropdown]                │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║                      MENU TAB SELECTED                        ║
║                                                               ║
║  Search: [menu items...] Sort: [Name ▼] [+ Add Item]         ║
║                                                               ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ ☐ Nyama Choma              ✓ Available                  │ ║
║  │    Grilled meat with spices                             │ ║
║  │    Category: Mains  Prep: 30m  Price: 850 KES           │ ║
║  │    [New price: _____] [Edit] [Delete]                   │ ║
║  │                                                          │ ║
║  │ ☐ Samosas                  ✓ Available                  │ ║
║  │    Crispy pastry with filling                           │ ║
║  │    Category: Appetizers  Prep: 10m  Price: 200 KES      │ ║
║  │    [New price: _____] [Edit] [Delete]                   │ ║
║  │                                                          │ ║
║  │ ☐ Mango Juice              ✓ Available                  │ ║
║  │    Fresh mango juice                                    │ ║
║  │    Category: Drinks  Prep: 5m  Price: 250 KES           │ ║
║  │    [New price: _____] [Edit] [Delete]                   │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  [Select All] [Clear] [Bulk Delete]                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🔐 Authentication Flow

```
User enters credentials:
Email: admin@megapark.com
Password: admin123
                │
                ▼
        Clicks: LOGIN
                │
                ▼
    POST /api/auth/login
    Body: {email, password}
                │
                ▼
    Backend validates
    (checks database or mock user)
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
    Valid        Invalid
        │                │
        ▼                ▼
    Generate JWT   Show Error
    ├─ accessToken
    └─ refreshToken
        │
        ▼
    Return response:
    {
      accessToken: "eyJh...",
      refreshToken: "eyJh...",
      user: {
        id: "admin-001",
        email: "admin@megapark.com",
        role: "admin"
      }
    }
        │
        ▼
    Frontend stores tokens
    └─ localStorage.__megapark_jwt__
    └─ localStorage.__megapark_refresh__
        │
        ▼
    Redirect to Dashboard
        │
        ▼
    All future requests include:
    Authorization: Bearer {accessToken}
```

---

## 📊 Status Badge Colors

```
PENDING    ▯▯▯▯▯  Yellow/Orange
           (Awaiting admin approval)

CONFIRMED  ▯▯▯▯▯  Green
           (Ready for kitchen)

PREPARING  ▯▯▯▯▯  Blue
           (Cooking in progress)

READY      ▯▯▯▯▯  Purple
           (Ready for pickup)

DELIVERED  ▯▯▯▯▯  Green (checked)
           (Order complete)

CANCELLED  ▯▯▯▯▯  Red
           (Order cancelled)
```

---

## 🔌 API Request Examples

### LOGIN
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@megapark.com",
  "password": "admin123"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "admin-001",
    "email": "admin@megapark.com",
    "role": "admin"
  }
}
```

### CREATE ORDER
```
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+254712345678",
  "orderType": "delivery",
  "deliveryAddress": "123 Main St",
  "items": [
    {
      "itemName": "Nyama Choma",
      "quantity": 2,
      "unitPrice": 850,
      "totalPrice": 1700
    }
  ],
  "subtotal": 1700,
  "deliveryFee": 200,
  "tax": 228,
  "totalAmount": 2128,
  "status": "pending",
  "paymentStatus": "paid",
  "paymentMethod": "mpesa"
}

Response 201:
{
  "id": "ORDER-1639000123",
  "status": "pending",
  ...
}
```

### UPDATE ORDER STATUS
```
PUT http://localhost:3000/api/orders/ORDER-123
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "confirmed"
}

Response 200:
{
  "id": "ORDER-123",
  "status": "confirmed",
  ...
}
```

### ADD MENU ITEM
```
POST http://localhost:3000/api/menu
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Nyama Choma",
  "description": "Grilled meat with spices",
  "category": "mains",
  "price": 850,
  "preparationTime": 30
}

Response 201:
{
  "id": "menu-1639000456",
  "name": "Nyama Choma",
  ...
}
```

---

## 📈 System Status

```
                ┌─────────────────────────┐
                │   SYSTEM COMPONENTS     │
                └─────────────────────────┘
                           
        Backend         Frontend       Database
    ┌─────────────┐  ┌──────────┐  ┌──────────┐
    │  Express    │  │  React   │  │ Postgres │
    │  Node.js    │  │  Vite    │  │   / JSON │
    │ Port 3000   │  │Port 5173 │  │          │
    │             │  │          │  │          │
    │  ✓ Auth     │  │ ✓ Login  │  │ ✓ Orders │
    │  ✓ Orders   │  │ ✓ Orders │  │ ✓ Users  │
    │  ✓ Menu     │  │ ✓ Menu   │  │ ✓ Menu   │
    │  ✓ Payments │  │ ✓ Payment│  │          │
    └─────────────┘  └──────────┘  └──────────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    All Connected! ✓
```

---

## ⚡ Quick Action Reference

| Action | How To | Time |
|--------|-------|------|
| **Login** | Visit /admin/login, enter credentials | 1 min |
| **Approve Order** | Orders tab → Click dropdown → Select CONFIRMED | 10 sec |
| **Track Order** | Orders tab → Update status through workflow | 30 sec |
| **Add Menu** | Menu tab → "+ Add" → Fill form → Save | 2 min |
| **Edit Menu** | Menu tab → Click Edit → modify → Save | 1 min |
| **Delete Menu** | Menu tab → Click Delete → Confirm | 20 sec |
| **Change Price** | Menu tab → Enter price → Press Enter | 10 sec |
| **Bulk Delete** | Menu tab → Select items → "Bulk Delete" | 1 min |
| **Search** | Use search box → Type name | Instant |
| **Export** | Menu/Orders tab → Click "Export" | 30 sec |

---

## 🎯 Success Indicators

### When Everything is Working ✓

```
Backend Log Shows:
  [20:30:45] Connected to Postgres
  [20:30:45] Server started on port 3000

Frontend Shows:
  ✓ http://localhost:5173 loads
  ✓ Menu items visible
  ✓ /admin/login page loads

Admin Can:
  ✓ Login successfully
  ✓ See pending orders
  ✓ Change order status
  ✓ Add menu items
  ✓ Edit menu items
  ✓ Delete menu items

Tokens Present:
  ✓ localStorage.__megapark_jwt__ exists
  ✓ localStorage.__megapark_refresh__ exists

Database:
  ✓ Orders saved with status='pending'
  ✓ Menu items persist after refresh
  ✓ Order status changes reflected
```

---

## 🚀 Start Commands

```bash
# Terminal 1: Backend
$ cd backend && npm run dev
  Pino 8.0.0 | Server started on port 3000
  ✓ Ready for requests

# Terminal 2: Frontend
$ npm run dev
  ➜  Local: http://localhost:5173
  ➜  Ready for requests

# Verification
$ curl http://localhost:3000/api/health
  {"ok":true}
```

---

## 🔗 Key URLs

| Purpose | URL |
|---------|-----|
| Customer Menu | http://localhost:5173 |
| Admin Login | http://localhost:5173/admin/login |
| Admin Dashboard | http://localhost:5173/admin |
| Health Check | http://localhost:3000/api/health |
| API Docs | http://localhost:3000/api/docs |

---

## 📞 Support Quick Links

| Issue | Check |
|-------|-------|
| Backend won't start | Run: `cd backend && npm run dev` |
| Can't connect to API | Check: Backend running on 3000 |
| Can't login | Check: Email/Password correct |
| Orders not showing | Refresh page, check JWT in localStorage |
| Menu not saving | Ensure logged in (check JWT token) |
| Port already in use | Find process: `lsof -i :3000` then kill |

---

**READY TO USE! Start with Backend + Frontend commands above.** 🚀
