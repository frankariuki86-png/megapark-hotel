-- MegaPark Hotel Database Schema
-- Run this migration to initialize the database

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'mains' CHECK (category IN ('appetizers', 'mains', 'sides', 'desserts', 'drinks')),
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  availability BOOLEAN NOT NULL DEFAULT true,
  preparation_time INT NOT NULL DEFAULT 15,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Food Orders Table
CREATE TABLE IF NOT EXISTS food_orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  order_type VARCHAR(50) NOT NULL DEFAULT 'dine-in' CHECK (order_type IN ('delivery', 'dine-in', 'pickup')),
  order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivery_date DATE,
  delivery_address TEXT,
  items JSON NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users/Admin Table (for future auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'staff', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table (for hotel room bookings)
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(64) PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'standard' CHECK (type IN ('standard', 'double', 'deluxe', 'suite', 'executive')),
  description TEXT,
  price_per_night DECIMAL(10, 2) NOT NULL,
  images JSON NOT NULL DEFAULT '[]',
  amenities JSON NOT NULL DEFAULT '[]',
  capacity INT NOT NULL DEFAULT 2,
  availability BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Halls Table (for event bookings)
CREATE TABLE IF NOT EXISTS halls (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT NOT NULL DEFAULT 0,
  price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
  images JSON NOT NULL DEFAULT '[]',
  amenities JSON NOT NULL DEFAULT '[]',
  availability BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table (room and hall reservations)
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  booking_type VARCHAR(50) NOT NULL DEFAULT 'room' CHECK (booking_type IN ('room', 'hall')),
  booking_data JSON NOT NULL DEFAULT '{}',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'cancelled', 'completed')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_data JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Events Table (for future event bookings)
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  package VARCHAR(100),
  client_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  event_date DATE NOT NULL,
  guests INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Standalone indexes for PostgreSQL
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_availability ON menu_items(availability);
CREATE INDEX IF NOT EXISTS idx_menu_created_at ON menu_items(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON food_orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON food_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON food_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON food_orders(order_date);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_rooms_availability ON rooms(availability);
CREATE INDEX IF NOT EXISTS idx_rooms_price_per_night ON rooms(price_per_night);

CREATE INDEX IF NOT EXISTS idx_halls_availability ON halls(availability);
CREATE INDEX IF NOT EXISTS idx_halls_price_per_day ON halls(price_per_day);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_name);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_events_client ON events(client_name);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
