const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Cannot run seed.');
  process.exit(1);
}

const seedData = {
  menuItems: [
    {
      name: 'Nyama Choma',
      description: 'Grilled meat with local spices and vegetables',
      category: 'mains',
      price: 850,
      image: null,
      availability: true,
      preparationTime: 30
    },
    {
      name: 'Ugali with Sukuma Wiki',
      description: 'Traditional maize meal with sautéed greens',
      category: 'mains',
      price: 350,
      image: null,
      availability: true,
      preparationTime: 15
    },
    {
      name: 'Samosas',
      description: 'Crispy pastry with meat or vegetable filling',
      category: 'appetizers',
      price: 200,
      image: null,
      availability: true,
      preparationTime: 10
    },
    {
      name: 'Chapati',
      description: 'Soft flatbread',
      category: 'sides',
      price: 100,
      image: null,
      availability: true,
      preparationTime: 8
    },
    {
      name: 'Mango Juice',
      description: 'Fresh mango juice',
      category: 'drinks',
      price: 250,
      image: null,
      availability: true,
      preparationTime: 5
    }
  ],
  orders: [
    {
      customerName: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      customerPhone: '+254712111222',
      orderType: 'delivery',
      orderDate: new Date('2024-02-11T10:30:00'),
      deliveryDate: '2024-02-11',
      deliveryAddress: '123 Main Street, Nairobi',
      items: JSON.stringify([
        { itemName: 'Nyama Choma', quantity: 2, unitPrice: 850, totalPrice: 1700 },
        { itemName: 'Chapati', quantity: 2, unitPrice: 100, totalPrice: 200 }
      ]),
      subtotal: 1900,
      deliveryFee: 200,
      tax: 228,
      totalAmount: 2328,
      status: 'preparing',
      paymentStatus: 'paid',
      paymentMethod: 'mpesa'
    },
    {
      customerName: 'Bob Smith',
      customerEmail: 'bob@example.com',
      customerPhone: '+254798333444',
      orderType: 'dine-in',
      orderDate: new Date('2024-02-11T14:45:00'),
      deliveryDate: null,
      deliveryAddress: null,
      items: JSON.stringify([
        { itemName: 'Samosas', quantity: 6, unitPrice: 200, totalPrice: 1200 },
        { itemName: 'Mango Juice', quantity: 2, unitPrice: 250, totalPrice: 500 }
      ]),
      subtotal: 1700,
      deliveryFee: 0,
      tax: 204,
      totalAmount: 1904,
      status: 'ready',
      paymentStatus: 'paid',
      paymentMethod: 'stripe'
    }
  ],
  halls: [
    {
      name: 'Main Convention Hall',
      description: 'Spacious hall suitable for conferences and large events',
      capacity: 500,
      price_per_day: 20000,
      amenities: ['projector','stage','sound system'],
      images: [],
      availability: true
    },
    {
      name: 'Banquet Hall',
      description: 'Elegant hall for weddings and banquets',
      capacity: 300,
      price_per_day: 15000,
      amenities: ['catering','decor'],
      images: [],
      availability: true
    }
  ],
  rooms: [
    {
      room_number: '101',
      name: 'Single Room',
      type: 'single',
      description: 'Cozy single occupancy room',
      price_per_night: 5000,
      capacity: 1,
      amenities: ['wifi'],
      images: [],
      availability: true
    },
    {
      room_number: '201',
      name: 'Double Room',
      type: 'double',
      description: 'Room for two guests',
      price_per_night: 8000,
      capacity: 2,
      amenities: ['wifi','air conditioning'],
      images: [],
      availability: true
    }
  ]
};

const seed = async () => {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Truncate existing data
    console.log('\nTruncating existing data...');
    await client.query('DELETE FROM food_orders');
    await client.query('DELETE FROM menu_items');
    await client.query('DELETE FROM halls');
    await client.query('DELETE FROM rooms');

    // Seed menu items
    console.log('Seeding menu items...');
    for (const item of seedData.menuItems) {
      const q = `INSERT INTO menu_items (id, name, description, category, price, image, availability, preparation_time)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      await client.query(q, [
        uuidv4(),
        item.name,
        item.description,
        item.category,
        item.price,
        item.image,
        item.availability,
        item.preparationTime
      ]);
    }

    console.log(`✓ Seeded ${seedData.menuItems.length} menu items`);

    // Seed halls
    console.log('Seeding halls...');
    for (const hall of seedData.halls) {
      const q = `INSERT INTO halls (id, name, description, capacity, price_per_day, amenities, images, availability)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`;
      await client.query(q, [
        uuidv4(),
        hall.name,
        hall.description,
        hall.capacity,
        hall.price_per_day,
        hall.amenities,
        hall.images,
        hall.availability
      ]);
    }
    console.log(`✓ Seeded ${seedData.halls.length} halls`);

    // Seed rooms
    console.log('Seeding rooms...');
    for (const room of seedData.rooms) {
      const q = `INSERT INTO rooms (id, room_number, name, type, description, price_per_night, capacity, amenities, images, availability)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
      await client.query(q, [
        uuidv4(),
        room.room_number,
        room.name,
        room.type,
        room.description,
        room.price_per_night,
        room.capacity,
        room.amenities,
        room.images,
        room.availability
      ]);
    }
    console.log(`✓ Seeded ${seedData.rooms.length} rooms`);

    // Seed orders
    console.log('Seeding food orders...');
    for (const order of seedData.orders) {
      const q = `INSERT INTO food_orders (customer_name, customer_email, customer_phone, order_type, order_date, delivery_date, delivery_address, items, subtotal, delivery_fee, tax, total_amount, status, payment_status, payment_method)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
      await client.query(q, [
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.orderType,
        order.orderDate,
        order.deliveryDate,
        order.deliveryAddress,
        order.items,
        order.subtotal,
        order.deliveryFee,
        order.tax,
        order.totalAmount,
        order.status,
        order.paymentStatus,
        order.paymentMethod
      ]);
    }
    console.log(`✓ Seeded ${seedData.orders.length} food orders`);

    // ensure there is an admin user in the users table so the dashboard can
    // log in with the well‑known demo credentials.  the password and email
    // are driven from environment variables for flexibility.
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@megapark.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const bcrypt = require('bcrypt');
    try {
      const hash = await bcrypt.hash(adminPassword, 10);
      await client.query(
        `INSERT INTO users(id, email, password_hash, name, role, is_active)
         VALUES($1,$2,$3,$4,'admin',true)
         ON CONFLICT (email) DO NOTHING`,
        [`admin-${Date.now()}`, adminEmail, hash, 'Admin User']
      );
      console.log('✓ ensured admin user exists (email='+adminEmail+')');
    } catch (e) {
      console.warn('could not create admin user during seed:', e.message);
    }

    console.log('\n✓ Seed completed successfully');
  } catch (e) {
    console.error('❌ Seed error:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

seed();
