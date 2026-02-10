import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchMenuItems, saveMenuItems, createMenuItem, updateMenuItemApi, deleteMenuItemApi, fetchOrders, updateOrderApi, saveOrders, loginAdmin, logoutAdmin } from '../api/mockApi';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [rooms, setRooms] = useState([
    {
      id: 'room-standard',
      name: 'Standard Room',
      price: 5000,
      capacity: 2,
      amenities: ['Free WiFi', 'Air Conditioning', 'En-suite Bathroom', 'Flat-screen TV', 'Work Desk'],
      description: 'Comfortable and affordable accommodation perfect for single travelers or couples.',
      status: 'available',
      blockedDates: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'room-deluxe',
      name: 'Deluxe Room',
      price: 8000,
      capacity: 3,
      amenities: ['Free WiFi', 'Air Conditioning', 'En-suite Bathroom', 'Flat-screen TV', 'Mini Bar', 'Safe', 'Bathrobe & Slippers'],
      description: 'Spacious room with premium amenities and stunning views of the resort grounds.',
      status: 'available',
      blockedDates: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'room-executive',
      name: 'Executive Suite',
      price: 12000,
      capacity: 4,
      amenities: ['Free WiFi', 'Air Conditioning', 'En-suite Bathroom', 'Smart TV', 'Mini Bar', 'Safe', 'Bathrobe & Slippers', 'Jacuzzi Tub', 'Living Area', 'Premium Toiletries'],
      description: 'Luxurious suite with separate living area, premium amenities, and personalized services.',
      status: 'available',
      blockedDates: [],
      createdAt: new Date().toISOString()
    }
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 'BOOK-001',
      roomId: 'room-standard',
      roomName: 'Standard Room',
      guestName: 'John Doe',
      email: 'john@example.com',
      phone: '+254712345678',
      checkIn: '2024-02-15',
      checkOut: '2024-02-18',
      nights: 3,
      guests: 2,
      totalPrice: 15000,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2024-02-10'
    },
    {
      id: 'BOOK-002',
      roomId: 'room-deluxe',
      roomName: 'Deluxe Room',
      guestName: 'Sarah Smith',
      email: 'sarah@example.com',
      phone: '+254798765432',
      checkIn: '2024-02-20',
      checkOut: '2024-02-25',
      nights: 5,
      guests: 3,
      totalPrice: 40000,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2024-02-11'
    }
  ]);

  const [events, setEvents] = useState([
    {
      id: 'EVENT-001',
      type: 'Wedding',
      package: 'Premium',
      clientName: 'Michael Brown',
      email: 'michael@example.com',
      phone: '+254701234567',
      eventDate: '2024-03-15',
      guests: 150,
      totalPrice: 120000,
      status: 'confirmed',
      paymentStatus: 'paid',
      notes: 'Outdoor ceremony with reception',
      createdAt: '2024-02-05'
    },
    {
      id: 'EVENT-002',
      type: 'Conference',
      package: 'Standard',
      clientName: 'Tech Solutions Ltd',
      email: 'info@techsolutions.com',
      phone: '+254723456789',
      eventDate: '2024-03-20',
      guests: 200,
      totalPrice: 60000,
      status: 'pending',
      paymentStatus: 'pending',
      notes: '2-day conference with lunch and coffee breaks',
      createdAt: '2024-02-08'
    }
  ]);

  const [menuItems, setMenuItems] = useState([
    {
      id: 'menu-001',
      name: 'Nyama Choma',
      description: 'Grilled meat with local spices and vegetables',
      category: 'mains',
      price: 850,
      image: '',
      availability: true,
      preparationTime: 30,
      createdAt: '2024-01-01'
    },
    {
      id: 'menu-002',
      name: 'Ugali with Sukuma Wiki',
      description: 'Traditional maize meal with sautéed greens',
      category: 'mains',
      price: 350,
      image: '',
      availability: true,
      preparationTime: 15,
      createdAt: '2024-01-01'
    },
    {
      id: 'menu-003',
      name: 'Samosas',
      description: 'Crispy pastry with meat or vegetable filling',
      category: 'appetizers',
      price: 200,
      image: '',
      availability: true,
      preparationTime: 10,
      createdAt: '2024-01-01'
    },
    {
      id: 'menu-004',
      name: 'Chapati',
      description: 'Soft flatbread',
      category: 'sides',
      price: 100,
      image: '',
      availability: true,
      preparationTime: 8,
      createdAt: '2024-01-01'
    },
    {
      id: 'menu-005',
      name: 'Mango Juice',
      description: 'Fresh mango juice',
      category: 'drinks',
      price: 250,
      image: '',
      availability: true,
      preparationTime: 5,
      createdAt: '2024-01-01'
    }
  ]);

  const [foodOrders, setFoodOrders] = useState([
    {
      id: 'ORDER-001',
      customerName: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      customerPhone: '+254712111222',
      orderType: 'delivery',
      orderDate: '2024-02-11T10:30:00',
      deliveryDate: '2024-02-11',
      deliveryAddress: '123 Main Street, Nairobi',
      items: [
        { itemName: 'Nyama Choma', quantity: 2, unitPrice: 850, totalPrice: 1700 },
        { itemName: 'Chapati', quantity: 2, unitPrice: 100, totalPrice: 200 }
      ],
      subtotal: 1900,
      deliveryFee: 200,
      tax: 228,
      totalAmount: 2328,
      status: 'preparing',
      paymentStatus: 'paid',
      paymentMethod: 'mpesa',
      createdAt: '2024-02-11'
    },
    {
      id: 'ORDER-002',
      customerName: 'Bob Smith',
      customerEmail: 'bob@example.com',
      customerPhone: '+254798333444',
      orderType: 'dine-in',
      orderDate: '2024-02-11T14:45:00',
      deliveryDate: null,
      deliveryAddress: null,
      items: [
        { itemName: 'Samosas', quantity: 6, unitPrice: 200, totalPrice: 1200 },
        { itemName: 'Mango Juice', quantity: 2, unitPrice: 250, totalPrice: 500 }
      ],
      subtotal: 1700,
      deliveryFee: 0,
      tax: 204,
      totalAmount: 1904,
      status: 'ready',
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      createdAt: '2024-02-11'
    }
  ]);

  // Initialize mock API storage on mount (seed if empty)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const remoteMenu = await fetchMenuItems();
        if (mounted) {
          if (remoteMenu && remoteMenu.length > 0) setMenuItems(remoteMenu);
          else await saveMenuItems(menuItems);
        }
        // Only fetch orders if user is logged in (has adminUser)
        if (adminUser) {
          const remoteOrders = await fetchOrders();
          if (mounted) {
            if (remoteOrders && remoteOrders.length > 0) setFoodOrders(remoteOrders);
            else await saveOrders(foodOrders);
          }
        }
      } catch (err) {
        // don't block app on mock api failures
        // console.warn('mockApi init failed', err);
      }
    })();
    return () => { mounted = false };
  }, [adminUser]);

  // Real backend login via API
  const adminLogin = useCallback(async (email, password) => {
    try {
      const result = await loginAdmin(email, password);
      const user = result.user || {
        id: result.id || 'admin-001',
        email: result.email || email,
        name: result.name || 'Admin User',
        role: result.role || 'admin',
        loginTime: new Date().toISOString()
      };
      setAdminUser(user);
      localStorage.setItem('adminUser', JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      // ignore logout errors
    }
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  }, []);

  // Room Management
  const updateRoom = useCallback((roomId, updates) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, ...updates, updatedAt: new Date().toISOString() }
          : room
      )
    );
  }, []);

  const blockRoomDates = useCallback((roomId, dates) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, blockedDates: [...(room.blockedDates || []), ...dates] }
          : room
      )
    );
  }, []);

  // Booking Management
  const updateBooking = useCallback((bookingId, updates) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
          : booking
      )
    );
  }, []);

  const cancelBooking = useCallback((bookingId) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled', updatedAt: new Date().toISOString() }
          : booking
      )
    );
  }, []);

  // Event Management
  const updateEvent = useCallback((eventId, updates) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    );
  }, []);

  const cancelEvent = useCallback((eventId) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, status: 'cancelled', updatedAt: new Date().toISOString() }
          : event
      )
    );
  }, []);

  // Menu Item Management
  const addMenuItem = useCallback(async (menuItem) => {
    const created = await createMenuItem(menuItem);
    setMenuItems(prev => [created, ...prev]);
    return created;
  }, []);

  const updateMenuItem = useCallback(async (itemId, updates) => {
    const updated = await updateMenuItemApi(itemId, updates);
    setMenuItems(prev => prev.map(item => item.id === itemId ? updated : item));
    return updated;
  }, []);

  const deleteMenuItem = useCallback(async (itemId) => {
    await deleteMenuItemApi(itemId);
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateMenuItemPrice = useCallback(async (itemId, newPrice) => {
    const updated = await updateMenuItemApi(itemId, { price: newPrice });
    setMenuItems(prev => prev.map(item => item.id === itemId ? updated : item));
    return updated;
  }, []);

  const toggleMenuItemAvailability = useCallback(async (itemId) => {
    // optimistic update
    setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, availability: !item.availability } : item));
    const cur = menuItems.find(i => i.id === itemId);
    const newAvail = cur ? !cur.availability : true;
    try {
      await updateMenuItemApi(itemId, { availability: newAvail });
    } catch (e) {
      // ignore for mock
    }
  }, [menuItems]);

  // Food Order Management
  const updateFoodOrder = useCallback(async (orderId, updates) => {
    const updated = await updateOrderApi(orderId, updates);
    setFoodOrders(prev => prev.map(order => order.id === orderId ? updated : order));
    return updated;
  }, []);

  const cancelFoodOrder = useCallback(async (orderId) => {
    const updated = await updateOrderApi(orderId, { status: 'cancelled' });
    setFoodOrders(prev => prev.map(order => order.id === orderId ? updated : order));
    return updated;
  }, []);

  const value = {
    adminUser,
    adminLogin,
    adminLogout,
    rooms,
    updateRoom,
    blockRoomDates,
    bookings,
    updateBooking,
    cancelBooking,
    events,
    updateEvent,
    cancelEvent,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateMenuItemPrice,
    toggleMenuItemAvailability,
    foodOrders,
    updateFoodOrder,
    cancelFoodOrder
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
