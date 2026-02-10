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
  deliveryAddress: z.string().nullable().optional(),
  items: z.array(OrderItemSchema).min(1, 'At least one item required'),
  subtotal: z.number().min(0),
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
  description: z.string().optional()
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

module.exports = {
  MenuItemCreateSchema,
  MenuItemUpdateSchema,
  OrderCreateSchema,
  OrderUpdateSchema,
  LoginSchema,
  PaymentIntentSchema,
  AdminUserCreateSchema,
  AdminUserUpdateSchema
  
};
