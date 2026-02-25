import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchMenuItems, saveMenuItems, createMenuItem, updateMenuItemApi, deleteMenuItemApi, fetchOrders, updateOrderApi, saveOrders, loginAdmin, logoutAdmin, fetchHalls, createHall, updateHallApi, deleteHallApi, fetchRooms, createRoom, updateRoomApi, deleteRoomApi } from '../api/mockApi';

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

  const [halls, setHalls] = useState([
    {
      id: 'hall-001',
      name: 'Grand Ballroom',
      description: 'Spacious hall perfect for weddings, conferences, and large events',
      capacity: 500,
      pricePerDay: 50000,
      images: [],
      amenities: ['Air Conditioning', 'Sound System', 'Projector', 'Catering Facilities', 'Wheelchair Accessible'],
      availability: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'hall-002',
      name: 'Conference Room',
      description: 'Modern meeting space with latest technology for corporate events',
      capacity: 100,
      pricePerDay: 15000,
      images: [],
      amenities: ['WiFi', 'Video Conference Setup', 'Whiteboard', 'LED Screen'],
      availability: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const [halls_state, setHallsState] = useState({
    loading: false,
    error: null
  });

  const [rooms_state, setRoomsState] = useState({
    loading: false,
    error: null
  });

  // Initialize mock API storage on mount (seed if empty)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[AdminContext] Initializing - fetching menu items...');
        const remoteMenu = await fetchMenuItems();
        console.log('[AdminContext] Menu fetch result:', remoteMenu);
        if (mounted) {
          if (remoteMenu && remoteMenu.length > 0) {
            console.log('[AdminContext] Setting menu from remote:', remoteMenu.length, 'items');
            setMenuItems(remoteMenu);
          } else {
            console.log('[AdminContext] Remote menu empty, seeding with defaults');
            await saveMenuItems(menuItems);
          }
        }
        
        // Fetch halls and rooms
        try {
          console.log('[AdminContext] Fetching halls...');
          const remoteHalls = await fetchHalls();
          console.log('[AdminContext] Halls fetch result:', remoteHalls);
          if (mounted && remoteHalls && remoteHalls.length > 0) {
            console.log('[AdminContext] Setting halls from remote:', remoteHalls.length, 'halls');
            setHalls(remoteHalls);
          }
        } catch (e) {
          console.warn('[AdminContext] Halls fetch error (non-fatal):', e.message);
        }
        
        try {
          console.log('[AdminContext] Fetching rooms...');
          const remoteRooms = await fetchRooms();
          console.log('[AdminContext] Rooms fetch result:', remoteRooms);
          if (mounted && remoteRooms && remoteRooms.length > 0) {
            console.log('[AdminContext] Setting rooms from remote:', remoteRooms.length, 'rooms');
            setRooms(remoteRooms);
          }
        } catch (e) {
          console.warn('[AdminContext] Rooms fetch error (non-fatal):', e.message);
        }
        
        // Only fetch orders if user is logged in (has adminUser)
        if (adminUser) {
          try {
            console.log('[AdminContext] Fetching orders for logged-in user...');
            const remoteOrders = await fetchOrders();
            console.log('[AdminContext] Orders fetch result:', remoteOrders);
            if (mounted) {
              if (remoteOrders && remoteOrders.length > 0) {
                console.log('[AdminContext] Setting orders from remote:', remoteOrders.length, 'orders');
                setFoodOrders(remoteOrders);
              } else {
                console.log('[AdminContext] Remote orders empty, seeding with defaults');
                await saveOrders(foodOrders);
              }
            }
          } catch (e) {
            console.warn('[AdminContext] Orders fetch error:', e.message);
          }
        }
      } catch (err) {
        console.error('[AdminContext] Critical initialization error:', err.message, err);
      }
    })();
    return () => { mounted = false };
  }, [adminUser]);

  // Real backend login via API
  const adminLogin = useCallback(async (email, password) => {
    try {
      console.log('[AdminContext] Attempting login with:', email);
      const result = await loginAdmin(email, password);
      console.log('[AdminContext] Login result:', result);
      const user = result.user || {
        id: result.id || 'admin-001',
        email: result.email || email,
        name: result.name || 'Admin User',
        role: result.role || 'admin',
        loginTime: new Date().toISOString()
      };
      console.log('[AdminContext] Setting admin user:', user);
      setAdminUser(user);
      localStorage.setItem('adminUser', JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      console.error('[AdminContext] Login error:', err.message);
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
    try {
      console.log('[AdminContext] Creating menu item:', menuItem);
      const created = await createMenuItem(menuItem);
      console.log('[AdminContext] Menu item created:', created);
      setMenuItems(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('[AdminContext] Error creating menu item:', err.message);
      throw err;
    }
  }, []);

  const updateMenuItem = useCallback(async (itemId, updates) => {
    try {
      console.log('[AdminContext] Updating menu item:', itemId, updates);
      const updated = await updateMenuItemApi(itemId, updates);
      console.log('[AdminContext] Menu item updated:', updated);
      setMenuItems(prev => prev.map(item => item.id === itemId ? updated : item));
      return updated;
    } catch (err) {
      console.error('[AdminContext] Error updating menu item:', err.message);
      throw err;
    }
  }, []);

  const deleteMenuItem = useCallback(async (itemId) => {
    try {
      console.log('[AdminContext] Deleting menu item:', itemId);
      await deleteMenuItemApi(itemId);
      console.log('[AdminContext] Menu item deleted');
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('[AdminContext] Error deleting menu item:', err.message);
      throw err;
    }
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

  // Hall Management
  const addHall = useCallback(async (hall) => {
    try {
      console.log('[AdminContext] Creating hall:', hall);
      const created = await createHall(hall);
      console.log('[AdminContext] Hall created:', created);
      setHalls(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('[AdminContext] Error creating hall:', err.message);
      throw err;
    }
  }, []);

  const updateHall = useCallback(async (hallId, updates) => {
    try {
      console.log('[AdminContext] Updating hall:', hallId, updates);
      const updated = await updateHallApi(hallId, updates);
      console.log('[AdminContext] Hall updated:', updated);
      setHalls(prev => prev.map(h => h.id === hallId ? updated : h));
      return updated;
    } catch (err) {
      console.error('[AdminContext] Error updating hall:', err.message);
      throw err;
    }
  }, []);

  const deleteHall = useCallback(async (hallId) => {
    try {
      console.log('[AdminContext] Deleting hall:', hallId);
      await deleteHallApi(hallId);
      console.log('[AdminContext] Hall deleted');
      setHalls(prev => prev.filter(h => h.id !== hallId));
    } catch (err) {
      console.error('[AdminContext] Error deleting hall:', err.message);
      throw err;
    }
  }, []);

  const toggleHallAvailability = useCallback(async (hallId) => {
    setHalls(prev => prev.map(h => h.id === hallId ? { ...h, availability: !h.availability } : h));
    const cur = halls.find(h => h.id === hallId);
    const newAvail = cur ? !cur.availability : true;
    try {
      await updateHallApi(hallId, { availability: newAvail });
    } catch (e) {
      // ignore for mock
    }
  }, [halls]);

  // Room Management (for admin)
  const addRoom = useCallback(async (room) => {
    try {
      console.log('[AdminContext] Creating room:', room);
      const created = await createRoom(room);
      console.log('[AdminContext] Room created:', created);
      setRooms(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('[AdminContext] Error creating room:', err.message);
      throw err;
    }
  }, []);

  const updateRoomAdmin = useCallback(async (roomId, updates) => {
    try {
      console.log('[AdminContext] Updating room:', roomId, updates);
      const updated = await updateRoomApi(roomId, updates);
      console.log('[AdminContext] Room updated:', updated);
      setRooms(prev => prev.map(r => r.id === roomId ? updated : r));
      return updated;
    } catch (err) {
      console.error('[AdminContext] Error updating room:', err.message);
      throw err;
    }
  }, []);

  const deleteRoom = useCallback(async (roomId) => {
    try {
      console.log('[AdminContext] Deleting room:', roomId);
      await deleteRoomApi(roomId);
      console.log('[AdminContext] Room deleted');
      setRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) {
      console.error('[AdminContext] Error deleting room:', err.message);
      throw err;
    }
  }, []);

  const toggleRoomAvailability = useCallback(async (roomId) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, availability: !r.availability } : r));
    const cur = rooms.find(r => r.id === roomId);
    const newAvail = cur ? !cur.availability : true;
    try {
      await updateRoomApi(roomId, { availability: newAvail });
    } catch (e) {
      // ignore for mock
    }
  }, [rooms]);

  const value = {
    adminUser,
    adminLogin,
    adminLogout,
    rooms,
    updateRoom,
    blockRoomDates,
    addRoom,
    updateRoomAdmin,
    deleteRoom,
    toggleRoomAvailability,
    halls,
    addHall,
    updateHall,
    deleteHall,
    toggleHallAvailability,
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
