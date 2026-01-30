# Backend Implementation Guide

## 🏗️ BACKEND ARCHITECTURE OVERVIEW

The frontend is fully prepared for backend integration. Here's what needs to be built.

---

## 📊 DATABASE SCHEMA

### 1. Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_addresses (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  full_name VARCHAR(100),
  phone VARCHAR(20),
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_payment_methods (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  type ENUM('mpesa', 'card', 'paypal') NOT NULL,
  phone_number VARCHAR(20),
  card_number_last4 VARCHAR(4),
  card_holder VARCHAR(100),
  expiry_date VARCHAR(5),
  paypal_email VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2. Products Tables
```sql
CREATE TABLE food_items (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_night DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL,
  image_url VARCHAR(255),
  amenities JSON,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE halls (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  area VARCHAR(50),
  image_url VARCHAR(255),
  base_price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hall_packages (
  id VARCHAR(255) PRIMARY KEY,
  hall_id VARCHAR(255) NOT NULL REFERENCES halls(id),
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  includes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Booking Tables
```sql
CREATE TABLE room_bookings (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  room_id VARCHAR(255) NOT NULL REFERENCES rooms(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('confirmed', 'cancelled', 'checked_in', 'checked_out') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE hall_bookings (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  hall_id VARCHAR(255) NOT NULL REFERENCES halls(id),
  package_id VARCHAR(255) NOT NULL REFERENCES hall_packages(id),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  number_of_guests INT NOT NULL,
  catering_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (hall_id) REFERENCES halls(id),
  FOREIGN KEY (package_id) REFERENCES hall_packages(id)
);
```

### 4. Orders & Payments
```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending_payment',
  delivery_address_id VARCHAR(255) REFERENCES user_addresses(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
  item_type ENUM('food', 'room', 'hall') NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE payments (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
  payment_method ENUM('mpesa', 'stripe', 'paypal') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(255) UNIQUE,
  payment_reference VARCHAR(255),
  payment_date TIMESTAMP,
  response_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 🔌 API ENDPOINTS

### Authentication Endpoints
```
POST /api/auth/register
- Body: { email, password, firstName, lastName, phone }
- Response: { user, token }

POST /api/auth/login
- Body: { email, password }
- Response: { user, token }

POST /api/auth/logout
- Headers: { Authorization: "Bearer token" }
- Response: { success: true }

GET /api/auth/profile
- Headers: { Authorization: "Bearer token" }
- Response: { user }
```

### User Endpoints
```
GET /api/users/addresses
- Headers: { Authorization: "Bearer token" }
- Response: [addresses]

POST /api/users/addresses
- Headers: { Authorization: "Bearer token" }
- Body: { fullName, phone, street, city, state, zipCode }
- Response: { address }

DELETE /api/users/addresses/:id
- Headers: { Authorization: "Bearer token" }
- Response: { success: true }

PUT /api/users/addresses/:id/default
- Headers: { Authorization: "Bearer token" }
- Response: { success: true }

GET /api/users/payment-methods
- Headers: { Authorization: "Bearer token" }
- Response: [paymentMethods]

POST /api/users/payment-methods
- Headers: { Authorization: "Bearer token" }
- Body: { type, phoneNumber/cardNumber/paypalEmail, ... }
- Response: { paymentMethod }
```

### Room Booking Endpoints
```
GET /api/rooms
- Response: [rooms]

GET /api/rooms/available
- Query: { checkInDate, checkOutDate, guests }
- Response: [availableRooms]

POST /api/room-bookings
- Headers: { Authorization: "Bearer token" }
- Body: { roomId, checkInDate, checkOutDate, guests }
- Response: { booking }

GET /api/room-bookings
- Headers: { Authorization: "Bearer token" }
- Response: [userBookings]

DELETE /api/room-bookings/:id
- Headers: { Authorization: "Bearer token" }
- Response: { success: true }
```

### Hall Booking Endpoints
```
GET /api/halls
- Response: [halls]

GET /api/halls/:id/packages
- Response: [packages]

GET /api/halls/available
- Query: { eventDate, eventTime, guests }
- Response: [availableHalls]

POST /api/hall-bookings
- Headers: { Authorization: "Bearer token" }
- Body: { hallId, packageId, eventDate, eventTime, guests, notes }
- Response: { booking }

GET /api/hall-bookings
- Headers: { Authorization: "Bearer token" }
- Response: [userBookings]

PUT /api/hall-bookings/:id
- Headers: { Authorization: "Bearer token" }
- Body: { status, ... }
- Response: { booking }
```

### Order Endpoints
```
POST /api/orders
- Headers: { Authorization: "Bearer token" }
- Body: { items, deliveryAddressId, paymentMethodId }
- Response: { order }

GET /api/orders
- Headers: { Authorization: "Bearer token" }
- Response: [orders]

GET /api/orders/:id
- Headers: { Authorization: "Bearer token" }
- Response: { order }

GET /api/orders/:id/status
- Headers: { Authorization: "Bearer token" }
- Response: { status, tracking }
```

### Payment Endpoints
```
POST /api/payments/mpesa/initiate
- Headers: { Authorization: "Bearer token" }
- Body: { orderId, phoneNumber, amount }
- Response: { checkoutRequestId, transactionId }

POST /api/payments/mpesa/callback
- Body: mpesaCallbackData
- Response: { success: true }

POST /api/payments/stripe
- Headers: { Authorization: "Bearer token" }
- Body: { orderId, paymentMethodId, amount }
- Response: { clientSecret, paymentIntentId }

POST /api/payments/paypal/create
- Headers: { Authorization: "Bearer token" }
- Body: { orderId, amount }
- Response: { approvalUrl, paymentId }

POST /api/payments/paypal/capture
- Headers: { Authorization: "Bearer token" }
- Body: { paymentId, payerId }
- Response: { success: true, transaction }
```

---

## 🔐 AUTHENTICATION & SECURITY

### JWT Implementation
```javascript
// Generate JWT Token
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify Token Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

### Password Hashing
```javascript
// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const passwordMatch = await bcrypt.compare(password, hashedPassword);
```

---

## 💳 PAYMENT GATEWAY INTEGRATION

### 1. M-Pesa (Daraja API)

```javascript
// Initiate STK Push
const axios = require('axios');

const initiateSTK = async (phoneNumber, amount, orderId) => {
  const token = await getAccessToken();
  
  const response = await axios.post(
    'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: process.env.MPESA_PASSWORD,
      Timestamp: moment().format('YYYYMMDDHHmmss'),
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: orderId,
      TransactionDesc: 'Megapark Resort Payment'
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  return response.data;
};

// Handle Callback
app.post('/api/payments/mpesa/callback', (req, res) => {
  const { Body } = req.body;
  const result = Body.stkCallback;
  
  if (result.ResultCode === 0) {
    // Payment successful
    updateOrderPaymentStatus(result.CheckoutRequestID, 'completed');
  } else {
    // Payment failed
    updateOrderPaymentStatus(result.CheckoutRequestID, 'failed');
  }
  
  res.json({ success: true });
});
```

### 2. Stripe

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
const createPaymentIntent = async (amount, orderId) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'kes',
    metadata: { orderId },
    description: 'Megapark Resort Order'
  });
  
  return paymentIntent;
};

// Confirm Payment
const confirmPayment = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status === 'succeeded') {
    // Payment successful
    updateOrderPaymentStatus(paymentIntent.metadata.orderId, 'completed');
  }
  
  return paymentIntent;
};
```

### 3. PayPal

```javascript
const paypal = require('@paypal/checkout-server-sdk');

const createPayPalPayment = async (amount, orderId) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  
  request.body = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'KES',
        value: amount.toString()
      },
      description: 'Megapark Resort Order'
    }],
    application_context: {
      return_url: `${process.env.APP_URL}/checkout?orderId=${orderId}`,
      cancel_url: `${process.env.APP_URL}/checkout?canceled=true`
    }
  };
  
  const order = await client.execute(request);
  return order.result;
};
```

---

## 🔄 WORKFLOW EXAMPLES

### Room Booking Workflow
1. User selects dates, guests, room
2. Frontend sends POST /api/room-bookings
3. Backend validates availability
4. Backend creates booking
5. Frontend adds to cart
6. User proceeds to checkout
7. Payment processed
8. Order created with booking details

### Hall Booking Workflow
1. User selects event date, guests, hall, package
2. Frontend calculates catering (500 * guests)
3. Frontend sends to checkout
4. User logs in
5. Proceeds to payment
6. Payment processed
7. Order created with hall booking
8. Hall marked unavailable for that date/time

### Food Order + Room Booking Workflow
1. User adds food items to cart
2. User books a room
3. Both items in cart
4. Checkout shows combined items
5. Single payment for both
6. Single order created with mixed items

---

## 🛠️ TECH STACK RECOMMENDATIONS

### Backend
- **Framework:** Node.js + Express.js
- **Database:** PostgreSQL or MySQL
- **ORM:** Sequelize or TypeORM
- **Auth:** JWT (jsonwebtoken)
- **Hashing:** bcryptjs

### Deployment
- **Server:** AWS EC2 or Heroku
- **Database:** AWS RDS
- **Storage:** AWS S3 for images
- **CDN:** CloudFlare

### Development Tools
- **Version Control:** Git
- **Testing:** Jest + Supertest
- **Logging:** Morgan + Winston
- **Validation:** Joi or Yup

---

## ✅ INTEGRATION CHECKLIST

- [ ] Create database schema
- [ ] Set up Express server
- [ ] Implement JWT authentication
- [ ] Create user registration/login endpoints
- [ ] Implement address management API
- [ ] Implement payment method management API
- [ ] Create room availability checking
- [ ] Create room booking API
- [ ] Create hall availability checking
- [ ] Create hall booking API
- [ ] Create order API
- [ ] Integrate M-Pesa (Daraja)
- [ ] Integrate Stripe
- [ ] Integrate PayPal
- [ ] Implement email notifications
- [ ] Implement order tracking
- [ ] Create admin dashboard API
- [ ] Implement inventory management
- [ ] Set up error handling & logging
- [ ] Implement rate limiting
- [ ] Add database backups
- [ ] Create API documentation
- [ ] Deploy to production

---

## 📖 ENVIRONMENT VARIABLES

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=megapark_resort
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# M-Pesa (Daraja)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=live

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# App
APP_URL=https://yourdomain.com
NODE_ENV=production
PORT=3000
```

---

**Backend Status:** 🚀 Ready for Development
**Estimated Development Time:** 4-6 weeks
**Complexity Level:** Medium to High
