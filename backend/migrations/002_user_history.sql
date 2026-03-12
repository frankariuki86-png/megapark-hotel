-- Migration 002: User order/booking history
-- Creates food_orders table and adds missing columns to bookings table

-- food_orders table (stores food/restaurant orders linked to a customer email)
CREATE TABLE IF NOT EXISTS food_orders (
  id text PRIMARY KEY,
  customer_name text,
  customer_email text,
  customer_phone text,
  order_type text DEFAULT 'dine-in',
  order_date timestamptz DEFAULT now(),
  delivery_date text,
  delivery_address jsonb,
  items jsonb,
  subtotal numeric DEFAULT 0,
  delivery_fee numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns to bookings table (backend expects these but they may not exist)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type text DEFAULT 'room';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_data jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total numeric DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_data jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
