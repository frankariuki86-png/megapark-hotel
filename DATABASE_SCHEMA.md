# Megapark Hotel - Database Schema Design

## Overview
This document outlines the complete database schema for the Megapark Resort management system, including all tables, relationships, and constraints.

---

## 1. USERS TABLE
User accounts for guests and staff.

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL (hashed),
  phone VARCHAR(20),
  role ENUM('guest', 'admin') DEFAULT 'guest',
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastLogin TIMESTAMP NULL,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_createdAt (createdAt)
);
```

---

## 2. ROOMS TABLE
Hotel room inventory and management.

```sql
CREATE TABLE rooms (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL,
  status ENUM('available', 'maintenance', 'unavailable') DEFAULT 'available',
  roomType ENUM('standard', 'deluxe', 'executive', 'suite') NOT NULL,
  image VARCHAR(255),
  galleryImages JSON, -- Array of image URLs
  amenities JSON, -- Array of amenity strings
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(36) REFERENCES users(id),
  
  INDEX idx_roomType (roomType),
  INDEX idx_status (status),
  INDEX idx_price (price)
);
```

---

## 3. ROOM_BOOKINGS TABLE
Guest room reservations.

```sql
CREATE TABLE room_bookings (
  id VARCHAR(36) PRIMARY KEY,
  roomId VARCHAR(36) NOT NULL REFERENCES rooms(id),
  guestId VARCHAR(36) REFERENCES users(id),
  guestName VARCHAR(100) NOT NULL,
  guestEmail VARCHAR(120) NOT NULL,
  guestPhone VARCHAR(20) NOT NULL,
  checkInDate DATE NOT NULL,
  checkOutDate DATE NOT NULL,
  nights INT NOT NULL,
  guests INT NOT NULL,
  roomPrice DECIMAL(10, 2) NOT NULL,
  totalPrice DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  paymentMethod VARCHAR(50), -- 'mpesa', 'stripe', 'paypal'
  transactionId VARCHAR(100),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_roomId (roomId),
  INDEX idx_guestId (guestId),
  INDEX idx_checkInDate (checkInDate),
  INDEX idx_status (status),
  INDEX idx_paymentStatus (paymentStatus),
  UNIQUE INDEX idx_booking_dates (roomId, checkInDate, checkOutDate)
);
```

---

## 4. ROOM_BLOCKED_DATES TABLE
Maintenance and blocked availability periods.

```sql
CREATE TABLE room_blocked_dates (
  id VARCHAR(36) PRIMARY KEY,
  roomId VARCHAR(36) NOT NULL REFERENCES rooms(id),
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  reason VARCHAR(255), -- 'maintenance', 'cleaning', 'blocked'
  createdBy VARCHAR(36) REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_roomId (roomId),
  INDEX idx_startDate (startDate),
  INDEX idx_endDate (endDate)
);
```

---

## 5. EVENTS TABLE
Event/function room bookings.

```sql
CREATE TABLE events (
  id VARCHAR(36) PRIMARY KEY,
  eventType VARCHAR(50) NOT NULL, -- 'wedding', 'conference', 'birthday', etc
  package VARCHAR(50) NOT NULL, -- 'standard', 'premium', 'luxury'
  clientName VARCHAR(100) NOT NULL,
  clientEmail VARCHAR(120) NOT NULL,
  clientPhone VARCHAR(20) NOT NULL,
  eventDate DATE NOT NULL,
  eventTime TIME,
  guestCount INT NOT NULL,
  hallPrice DECIMAL(10, 2) NOT NULL,
  cateringPrice DECIMAL(10, 2),
  totalPrice DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  paymentMethod VARCHAR(50),
  transactionId VARCHAR(100),
  notes TEXT,
  specialRequirements TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_eventDate (eventDate),
  INDEX idx_eventType (eventType),
  INDEX idx_status (status),
  INDEX idx_paymentStatus (paymentStatus)
);
```

---

## 6. MENU_ITEMS TABLE
Food and beverage menu.

```sql
CREATE TABLE menu_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'appetizers', 'mains', 'desserts', 'drinks'
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255),
  availability BOOLEAN DEFAULT TRUE,
  preparationTime INT, -- in minutes
  allergens JSON, -- Array of allergen warnings
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_price (price),
  INDEX idx_availability (availability)
);
```

---

## 7. ORDERS TABLE
Food/menu orders.

```sql
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) REFERENCES users(id),
  customerName VARCHAR(100) NOT NULL,
  customerEmail VARCHAR(120),
  customerPhone VARCHAR(20),
  orderType ENUM('dine-in', 'delivery', 'takeaway') DEFAULT 'delivery',
  orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deliveryDate DATE,
  deliveryAddress TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  deliveryFee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  totalAmount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  paymentMethod VARCHAR(50),
  transactionId VARCHAR(100),
  notes TEXT,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_userId (userId),
  INDEX idx_orderDate (orderDate),
  INDEX idx_deliveryDate (deliveryDate),
  INDEX idx_status (status),
  INDEX idx_paymentStatus (paymentStatus)
);
```

---

## 8. ORDER_ITEMS TABLE
Individual items in an order.

```sql
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menuItemId VARCHAR(36) REFERENCES menu_items(id),
  itemName VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(10, 2) NOT NULL,
  totalPrice DECIMAL(10, 2) NOT NULL,
  specialRequests TEXT,
  
  INDEX idx_orderId (orderId),
  INDEX idx_menuItemId (menuItemId)
);
```

---

## 9. PAYMENTS TABLE
Payment transaction records.

```sql
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  transactionId VARCHAR(100) UNIQUE NOT NULL,
  bookingId VARCHAR(36), -- nullable, can be for orders/events
  orderId VARCHAR(36),
  eventId VARCHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  paymentMethod VARCHAR(50) NOT NULL, -- 'mpesa', 'stripe', 'paypal'
  paymentGatewayResponse JSON, -- Store gateway response
  status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  mobilePhone VARCHAR(20), -- for M-Pesa
  cardLast4 VARCHAR(4), -- for Card payments
  paypalEmail VARCHAR(120),
  paidAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_transactionId (transactionId),
  INDEX idx_bookingId (bookingId),
  INDEX idx_orderId (orderId),
  INDEX idx_eventId (eventId),
  INDEX idx_status (status),
  INDEX idx_paidAt (paidAt)
);
```

---

## 10. REVIEWS TABLE
Guest reviews and ratings.

```sql
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  roomId VARCHAR(36) REFERENCES rooms(id),
  userId VARCHAR(36) REFERENCES users(id),
  bookingId VARCHAR(36) REFERENCES room_bookings(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  reviewText TEXT,
  cleanliness INT,
  comfort INT,
  service INT,
  value INT,
  isVerified BOOLEAN DEFAULT FALSE, -- verified booking
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_roomId (roomId),
  INDEX idx_userId (userId),
  INDEX idx_rating (rating),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);
```

---

## 11. PROMOTIONS TABLE
Discount codes and special offers.

```sql
CREATE TABLE promotions (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  discountType ENUM('percentage', 'fixed') DEFAULT 'percentage',
  discountValue DECIMAL(10, 2) NOT NULL,
  maxDiscount DECIMAL(10, 2), -- max discount amount
  minOrderAmount DECIMAL(10, 2), -- minimum order to apply
  applicableTo VARCHAR(50), -- 'rooms', 'orders', 'events', 'all'
  usageLimit INT, -- NULL for unlimited
  usageCount INT DEFAULT 0,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdBy VARCHAR(36) REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_isActive (isActive),
  INDEX idx_endDate (endDate)
);
```

---

## 12. ADMIN_LOGS TABLE
Audit trail for admin actions.

```sql
CREATE TABLE admin_logs (
  id VARCHAR(36) PRIMARY KEY,
  adminId VARCHAR(36) NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entityType VARCHAR(50), -- 'room', 'booking', 'order', 'event'
  entityId VARCHAR(36),
  oldValue JSON, -- previous state
  newValue JSON, -- new state
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_adminId (adminId),
  INDEX idx_entityType (entityType),
  INDEX idx_createdAt (createdAt)
);
```

---

## Relationships & Constraints

```
Users
  ├─ one-to-many → Room Bookings (guestId)
  ├─ one-to-many → Orders (userId)
  └─ one-to-many → Reviews (userId)

Rooms
  ├─ one-to-many → Room Bookings (roomId)
  ├─ one-to-many → Room Blocked Dates (roomId)
  └─ one-to-many → Reviews (roomId)

Room Bookings
  ├─ many-to-one → Rooms (roomId)
  ├─ many-to-one → Users (guestId)
  └─ one-to-one → Payments (bookingId)

Events
  └─ one-to-one → Payments (eventId)

Orders
  ├─ one-to-many → Order Items (orderId)
  ├─ many-to-one → Users (userId)
  └─ one-to-one → Payments (orderId)

Order Items
  └─ many-to-one → Menu Items (menuItemId)

Payments
  ├─ optional → Room Bookings (bookingId)
  ├─ optional → Orders (orderId)
  └─ optional → Events (eventId)
```

---

## Indexing Strategy

**High-Priority Indexes:**
- All foreign keys
- Search columns (email, phone, name)
- Frequent filter columns (status, paymentStatus, dates)
- Unique constraints

**Query Optimization:**
- Composite indexes for common filter combinations
  - `(roomId, checkInDate, checkOutDate)`
  - `(userId, status, createdAt)`
  - `(eventDate, eventType, status)`

---

## Data Validation Rules

### Room Bookings
- checkInDate < checkOutDate
- nights = days between dates
- totalPrice = roomPrice × nights
- Cannot book blocked dates
- Guest capacity ≤ room capacity

### Events
- eventDate ≥ today
- guestCount > 0
- totalPrice = hallPrice + cateringPrice (if applicable)

### Orders
- subtotal = sum of (quantity × unitPrice)
- totalAmount = subtotal + deliveryFee + tax
- deliveryDate ≥ orderDate (for delivery orders)

### Payments
- amount > 0
- transactionId must be unique
- Cannot pay for cancelled/completed bookings

### Reviews
- rating 1-5
- Only verified bookings can leave reviews (isVerified = true)
- One review per booking per user

---

## Migration Notes

When implementing:
1. Create base tables first (users, rooms, menu_items)
2. Create dependent tables (bookings, orders, events)
3. Create junction/audit tables (payments, logs, reviews)
4. Add foreign key constraints
5. Create indexes
6. Set up triggers for audit logs
7. Create stored procedures for complex operations

---

## Backup & Security

- Weekly full database backups
- Sensitive fields (password) must be hashed (bcrypt)
- Credit card data never stored (use Stripe vault)
- M-Pesa responses stored encrypted
- Access logs maintained in admin_logs
