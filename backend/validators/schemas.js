const { z } = require('zod');

// Menu Item Schemas
const MenuItemCreateSchema = z.object({
  name: z.string().min(1, 'name required').max(255),
  description: z.string().optional(),
  category: z.enum(['appetizers', 'mains', 'sides', 'desserts', 'drinks']).default('mains'),
  price: z.number().min(0, 'price must be >= 0'),
  image: z.string().nullable().optional(),
  preparationTime: z.number().int().min(0).default(15)
});

const MenuItemUpdateSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  category: z.enum(['appetizers', 'mains', 'sides', 'desserts', 'drinks']).optional(),
  price: z.number().min(0).optional(),
  image: z.string().nullable().optional(),
  availability: z.boolean().optional(),
  preparationTime: z.number().int().min(0).optional()
}).refine(obj => Object.keys(obj).length > 0, 'At least one field required');

// Order Schemas
const OrderItemSchema = z.object({
  itemName: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0)
});

const OrderCreateSchema = z.object({
  customerName: z.string().min(1, 'customer name required').max(255),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  orderType: z.enum(['delivery', 'dine-in', 'pickup']).default('dine-in'),
  orderDate: z.string().datetime().optional(),
  deliveryDate: z.string().nullable().optional(),
  deliveryAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(5),
    county: z.string().min(1),
    town: z.string().min(1),
    street: z.string().min(1),
    building: z.string().optional().nullable(),
    instructions: z.string().optional().nullable()
  }).nullable().optional(),
  items: z.array(OrderItemSchema).optional(),
  subtotal: z.number().min(0).optional().default(0),
  deliveryFee: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).default('pending'),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  paymentMethod: z.string().optional()
});

const OrderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  items: z.array(OrderItemSchema).optional()
}).refine(obj => Object.keys(obj).length > 0, 'At least one field required');

// Auth Schema
const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required')
});

// Payment Schema
const PaymentIntentSchema = z.object({
  id: z.string().optional(),
  totalPrice: z.number().min(0.01, 'Amount must be > 0'),
  customerName: z.string().min(1).max(255).optional(),
  customerEmail: z.string().email().optional(),
  description: z.string().optional(),
  bookingId: z.string().optional()
});


// Admin User Schemas
const AdminUserCreateSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name required').max(255),
  role: z.enum(['admin', 'staff']).default('staff')
});

const AdminUserUpdateSchema = z.object({
  name: z.string().max(255).optional(),
  role: z.enum(['admin', 'staff']).optional(),
  isActive: z.boolean().optional()
}).refine(obj => Object.keys(obj).length > 0, 'At least one field required');

// Hall Schemas
const HallCreateSchema = z.object({
  name: z.string().min(1, 'name required').max(255),
  description: z.string().optional(),
  capacity: z.number().int().min(1, 'capacity must be > 0'),
  pricePerDay: z.number().min(0, 'price must be >= 0'),
  images: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  availability: z.boolean().optional().default(true)
});

const HallUpdateSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
  pricePerDay: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  availability: z.boolean().optional()
}).refine(obj => Object.keys(obj).length > 0, 'At least one field required');

// Room Schemas
const RoomCreateSchema = z.object({
  roomNumber: z.string().min(1, 'room number required').max(50),
  name: z.string().min(1, 'name required').max(255),
  type: z.enum(['standard', 'double', 'deluxe', 'suite', 'executive']).default('standard'),
  description: z.string().optional(),
  pricePerNight: z.number().min(0, 'price must be >= 0'),
  images: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  capacity: z.number().int().min(1).optional().default(2),
  availability: z.boolean().optional().default(true)
});

const RoomUpdateSchema = z.object({
  roomNumber: z.string().max(50).optional(),
  name: z.string().max(255).optional(),
  type: z.enum(['standard', 'double', 'deluxe', 'suite', 'executive']).optional(),
  description: z.string().optional(),
  pricePerNight: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  capacity: z.number().int().min(1).optional(),
  availability: z.boolean().optional()
}).refine(obj => Object.keys(obj).length > 0, 'At least one field required');

module.exports = {
  MenuItemCreateSchema,
  MenuItemUpdateSchema,
  OrderCreateSchema,
  OrderUpdateSchema,
  LoginSchema,
  PaymentIntentSchema,
  AdminUserCreateSchema,
  AdminUserUpdateSchema,
  HallCreateSchema,
  HallUpdateSchema,
  RoomCreateSchema,
  RoomUpdateSchema
  
};
