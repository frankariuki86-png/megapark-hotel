import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchMenuItems, saveMenuItems, createMenuItem, updateMenuItemApi, deleteMenuItemApi, fetchOrders, updateOrderApi, saveOrders, fetchBookings, updateBookingApi, /* new */ loginAdmin, logoutAdmin, fetchHalls, createHall, updateHallApi, deleteHallApi, fetchRooms, createRoom, updateRoomApi, deleteRoomApi } from '../api/mockApi';

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

  // Clear admin session when the API signals token refresh has failed completely
  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn('[AdminContext] Session expired — clearing admin user');
      setAdminUser(null);
      localStorage.removeItem('adminUser');
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const [rooms, setRooms] = useState([]);

  // Helper to normalize room data from DB (snake_case) to UI (camelCase)
  const normalizeRoom = (room) => {
    if (!room) return room;
    return {
      id: room.id,
      roomNumber: room.room_number || room.roomNumber || '',
      name: room.name,
      type: room.type,
      description: room.description || '',
      pricePerNight: room.price_per_night !== undefined ? room.price_per_night : (room.pricePerNight !== undefined ? room.pricePerNight : 0),
      capacity: room.capacity || 2,
      amenities: room.amenities || [],
      availability: room.availability !== undefined ? room.availability : true,
      images: room.images || [],
      createdAt: room.created_at || room.createdAt || '',
      updatedAt: room.updated_at || room.updatedAt || ''
    };
  };

  const [bookings, setBookings] = useState([]);

  // listen for booking events emitted from cart context (or other parts of app)
  useEffect(() => {
    const handler = async (e) => {
      try {
        const newBooking = e.detail;
        if (newBooking && newBooking.id) {
          // optimistic UI update immediately
          setBookings(prev => [newBooking, ...prev]);
        }

        // attempt to refresh canonical bookings from backend so admin sees persisted data
        try {
          const remoteBookings = await fetchBookings();
          if (remoteBookings && remoteBookings.length) {
            const normalized = remoteBookings.map(b => {
              // booking data may be nested under booking_data or bookingData
              const bd = b.bookingData || b.booking_data || {};
              const parsedBd = typeof bd === 'string' ? (() => { try { return JSON.parse(bd); } catch { return {}; } })() : bd;
              const roomId = parsedBd.roomId || parsedBd.room_id || b.room_id || b.roomId || '';
              const room = rooms.find(r => r.id === roomId) || {};
              return {
                id: b.id,
                roomId: roomId,
                roomName: b.roomName || room.name || parsedBd.roomName || parsedBd.room || '',
                guestName: b.guestName || b.customerName || b.customer_name || '',
                email: b.email || b.customerEmail || b.customer_email || '',
                phone: b.phone || b.customerPhone || b.customer_phone || '',
                checkIn: b.checkIn || parsedBd.checkIn || parsedBd.check_in || b.check_in || '',
                checkOut: b.checkOut || parsedBd.checkOut || parsedBd.check_out || b.check_out || '',
                nights: parsedBd.nights || b.nights || 0,
                guests: parsedBd.guests || parsedBd.guestCount || b.guests || 0,
                totalPrice: b.totalPrice || b.total || b.total_price || 0,
                status: b.status || '',
                paymentStatus: b.paymentStatus || b.payment_status || '',
                createdAt: b.createdAt || b.created_at || ''
              };
            });
            setBookings(normalized);
          }
        } catch (fetchErr) {
          console.warn('[AdminContext] Could not refresh bookings after event:', fetchErr.message || fetchErr);
        }
      } catch (err) {
        console.warn('[AdminContext] new-booking handler error', err.message || err);
      }
    };
    window.addEventListener('new-booking', handler);
    return () => window.removeEventListener('new-booking', handler);
  }, [rooms]);

  const [events, setEvents] = useState([]);

  const [menuItems, setMenuItems] = useState([]);

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

  const [halls, setHalls] = useState([]);

  // Helper to normalize hall data from DB (snake_case) to UI (camelCase)
  const normalizeHall = (hall) => {
    if (!hall) return hall;
    return {
      id: hall.id,
      name: hall.name,
      description: hall.description || '',
      capacity: hall.capacity || 100,
      pricePerDay: hall.price_per_day || hall.pricePerDay || 0,
      amenities: hall.amenities || [],
      availability: hall.availability !== undefined ? hall.availability : true,
      images: hall.images || [],
      createdAt: hall.created_at || hall.createdAt || '',
      updatedAt: hall.updated_at || hall.updatedAt || ''
    };
  };

  const [halls_state, setHallsState] = useState({
    loading: false,
    error: null
  });

  const [rooms_state, setRoomsState] = useState({
    loading: false,
    error: null
  });

  // Initialize mock API storage on mount (seed if empty)
  // Run ONCE on mount only - don't re-fetch when adminUser changes to avoid rate limiting
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[AdminContext] Initializing on mount - fetching menu items...');
        const remoteMenu = await fetchMenuItems();
        console.log('[AdminContext] Menu fetch result:', remoteMenu);
        if (mounted) {
          if (remoteMenu && remoteMenu.length > 0) {
            console.log('[AdminContext] Setting menu from remote:', remoteMenu.length, 'items');
            setMenuItems(remoteMenu);
          } else {
            console.log('[AdminContext] Remote menu empty, seeding with defaults');
            // Delay before seeding to avoid immediate back-to-back requests
            await new Promise(r => setTimeout(r, 500));
            await saveMenuItems(menuItems);
          }
        }
        
        // Fetch halls and rooms (add delays between requests to avoid rate limiting)
        try {
          console.log('[AdminContext] Fetching halls...');
          await new Promise(r => setTimeout(r, 300)); // Stagger requests
          const remoteHalls = await fetchHalls();
          console.log('[AdminContext] Halls fetch result:', remoteHalls);
          if (mounted && remoteHalls && remoteHalls.length > 0) {
            console.log('[AdminContext] Setting halls from remote:', remoteHalls.length, 'halls');
            const normalized = remoteHalls.map(h => normalizeHall(h));
            setHalls(normalized);
          }
        } catch (e) {
          console.warn('[AdminContext] Halls fetch error (non-fatal):', e.message);
        }
        
        try {
          console.log('[AdminContext] Fetching rooms...');
          await new Promise(r => setTimeout(r, 300)); // Stagger requests
          const remoteRooms = await fetchRooms();
          console.log('[AdminContext] Rooms fetch result:', remoteRooms);
          if (mounted && remoteRooms && remoteRooms.length > 0) {
            console.log('[AdminContext] Setting rooms from remote:', remoteRooms.length, 'rooms');
            const normalized = remoteRooms.map(r => normalizeRoom(r));
            setRooms(normalized);
          }
        } catch (e) {
          console.warn('[AdminContext] Rooms fetch error (non-fatal):', e.message);
        }
      } catch (err) {
        console.error('[AdminContext] Critical initialization error:', err.message, err);
      }
    })();
    return () => { mounted = false };
  }, []); // Empty dependency array: run ONCE on mount only

  // Fetch orders and bookings separately ONLY when user is already logged in
  useEffect(() => {
    if (!adminUser) return; // Don't fetch if no user
    
    let mounted = true;
    (async () => {
      try {
        console.log('[AdminContext] Fetching orders for logged-in user...');
        await new Promise(r => setTimeout(r, 300)); // Stagger after login
        const remoteOrders = await fetchOrders();
        console.log('[AdminContext] Orders fetch result:', remoteOrders);
        if (mounted) {
          if (remoteOrders && remoteOrders.length > 0) {
            console.log('[AdminContext] Setting orders from remote:', remoteOrders.length, 'orders');
            const normalizedOrders = remoteOrders.map(o => ({
              id: o.id,
              customerName: o.customer_name || o.customerName || '',
              customerEmail: o.customer_email || o.customerEmail || '',
              customerPhone: o.customer_phone || o.customerPhone || '',
              orderType: o.order_type || o.orderType || '',
              orderDate: o.order_date || o.orderDate || '',
              deliveryDate: o.delivery_date || o.deliveryDate || '',
              deliveryAddress: o.delivery_address || o.deliveryAddress || null,
              items: o.items || [],
              subtotal: o.subtotal || o.sub_total || 0,
              deliveryFee: o.delivery_fee || o.deliveryFee || 0,
              tax: o.tax || 0,
              totalAmount: o.total_amount || o.totalAmount || 0,
              status: o.status,
              paymentStatus: o.payment_status || o.paymentStatus || '',
              paymentMethod: o.payment_method || o.paymentMethod || '',
              createdAt: o.created_at || o.createdAt || ''
            }));
            setFoodOrders(normalizedOrders);
          } else {
            console.log('[AdminContext] Remote orders empty - leaving local list empty');
          }
        }
      } catch (e) {
        console.warn('[AdminContext] Orders fetch error:', e.message);
      }

      // also try to fetch bookings (requires auth) so admin can see real reservations
      try {
        console.log('[AdminContext] Fetching bookings for logged-in user...');
        await new Promise(r => setTimeout(r, 300));
        const remoteBookings = await fetchBookings();
        console.log('[AdminContext] Bookings fetch result:', remoteBookings);
        if (mounted && remoteBookings && remoteBookings.length > 0) {
          console.log('[AdminContext] Normalizing and setting bookings from remote:', remoteBookings.length);
          const normalizeBooking = (b) => {
            // backend /api/bookings already returns normalizeDbBooking (camelCase flattened)
            const bd = b.bookingData || b.booking_data || {};
            const parsedBd = typeof bd === 'string' ? (() => { try { return JSON.parse(bd); } catch { return {}; } })() : bd;
            const room = rooms.find(r => r.id === (parsedBd.roomId || b.roomId || b.room_id || ''));
            return {
              id: b.id,
              roomId: parsedBd.roomId || b.roomId || b.room_id || '',
              roomName: b.roomName || parsedBd.roomName || (room ? room.name : '') || '',
              guestName: b.guestName || b.customerName || b.customer_name || '',
              email: b.email || b.customerEmail || b.customer_email || '',
              phone: b.phone || b.customerPhone || b.customer_phone || '',
              checkIn: b.checkIn || parsedBd.checkIn || b.check_in || '',
              checkOut: b.checkOut || parsedBd.checkOut || b.check_out || '',
              nights: b.nights || parsedBd.nights || 0,
              guests: b.guests || parsedBd.guests || 0,
              totalPrice: b.totalPrice || b.total || b.total_price || 0,
              status: b.status || '',
              paymentStatus: b.paymentStatus || b.payment_status || '',
              bookingType: b.bookingType || b.booking_type || 'room',
              createdAt: b.createdAt || b.created_at || ''
            };
          };
          const normalized = remoteBookings.map(normalizeBooking);
          setBookings(normalized);
        } else {
          console.log('[AdminContext] Remote bookings empty - leaving local list as-is');
        }
      } catch (e) {
        console.warn('[AdminContext] Bookings fetch error:', e.message);
      }
    })();
    return () => { mounted = false };
  }, [adminUser]); // Only re-fetch when user logs in/out

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
  const updateBooking = useCallback(async (bookingId, updates) => {
    // optimistically update local state
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
          : booking
      )
    );
    // send update to backend to persist
    try {
      await updateBookingApi(bookingId, updates);
    } catch (err) {
      console.warn('[AdminContext] updateBooking API error', err.message || err);
      // could optionally refetch bookings here
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled', updatedAt: new Date().toISOString() }
          : booking
      )
    );
    try {
      await updateBookingApi(bookingId, { status: 'cancelled' });
    } catch (err) {
      console.warn('[AdminContext] cancelBooking API error', err.message || err);
    }
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
  const normalizeOrder = (o) => {
    if (!o) return o;
    return {
      id: o.id,
      customerName: o.customer_name || o.customerName || '',
      customerEmail: o.customer_email || o.customerEmail || '',
      customerPhone: o.customer_phone || o.customerPhone || '',
      orderType: o.order_type || o.orderType || '',
      orderDate: o.order_date || o.orderDate || '',
      deliveryDate: o.delivery_date || o.deliveryDate || '',
      deliveryAddress: o.delivery_address || o.deliveryAddress || null,
      items: o.items || [],
      subtotal: o.subtotal || o.sub_total || 0,
      deliveryFee: o.delivery_fee || o.deliveryFee || 0,
      tax: o.tax || 0,
      totalAmount: o.total_amount || o.totalAmount || 0,
      status: o.status,
      paymentStatus: o.payment_status || o.paymentStatus || '',
      paymentMethod: o.payment_method || o.paymentMethod || '',
      createdAt: o.created_at || o.createdAt || ''
    };
  };

  const updateFoodOrder = useCallback(async (orderId, updates) => {
    const updatedRaw = await updateOrderApi(orderId, updates);
    const updated = normalizeOrder(updatedRaw);
    setFoodOrders(prev => prev.map(order => order.id === orderId ? updated : order));
    return updated;
  }, []);

  const cancelFoodOrder = useCallback(async (orderId) => {
    const updatedRaw = await updateOrderApi(orderId, { status: 'cancelled' });
    const updated = normalizeOrder(updatedRaw);
    setFoodOrders(prev => prev.map(order => order.id === orderId ? updated : order));
    return updated;
  }, []);

  // Hall Management
  const addHall = useCallback(async (hall) => {
    try {
      console.log('[AdminContext] Creating hall:', hall);
      const created = await createHall(hall);
      console.log('[AdminContext] Hall created:', created);
      const normalized = normalizeHall(created);
      setHalls(prev => [normalized, ...prev]);
      return normalized;
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
      const normalized = normalizeHall(updated);
      setHalls(prev => prev.map(h => h.id === hallId ? normalized : h));
      return normalized;
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
      const normalized = normalizeRoom(created);
      setRooms(prev => [normalized, ...prev]);
      return normalized;
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
      const normalized = normalizeRoom(updated);
      setRooms(prev => prev.map(r => r.id === roomId ? normalized : r));
      return normalized;
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
