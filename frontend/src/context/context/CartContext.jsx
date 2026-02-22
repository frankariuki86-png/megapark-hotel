import React, { createContext, useContext, useState, useCallback } from 'react';
import { createOrder } from '../api/mockApi';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const addToCart = useCallback((item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
            : cartItem
        );
      }
      
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const updateCartItem = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const getCartTotalForType = useCallback((type) => {
    return cart
      .filter(item => item.type === type)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getCartCountForType = useCallback((type) => {
    return cart
      .filter(item => item.type === type)
      .reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Place an order for menu (food) items. Sends to backend and waits for admin approval.
  // Status defaults to 'pending' until admin confirms.
  const placeMenuOrder = useCallback(async ({ customerName = '', customerEmail = '', customerPhone = '', orderType = 'dine-in', deliveryAddress = null, paymentMethod = 'after', paymentData = null, deliveryDate = null } = {}) => {
    const menuItems = cart.filter(item => item.type === 'food');
    if (menuItems.length === 0) return null;

    // Validate structured delivery address when required
    if (orderType === 'delivery') {
      const required = ['fullName','phone','county','town','street'];
      if (!deliveryAddress || typeof deliveryAddress !== 'object') {
        alert('Delivery address is required for delivery orders');
        return null;
      }
      const missing = required.filter(k => !deliveryAddress[k]);
      if (missing.length > 0) {
        alert(`Please provide delivery address fields: ${missing.join(', ')}`);
        return null;
      }
    }

    const orderDate = new Date();
    const subtotal = menuItems.reduce((t, it) => t + (it.price * it.quantity), 0);
    const deliveryFee = orderType === 'delivery' ? 200 : 0; // Fixed delivery fee for demo
    const tax = Math.round((subtotal + deliveryFee) * 0.12); // 12% tax
    const totalAmount = subtotal + deliveryFee + tax;
    const delivery = deliveryDate ? new Date(deliveryDate) : orderDate;

    const orderPayload = {
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      orderDate: orderDate.toISOString(),
      deliveryDate: delivery.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      items: menuItems.map(it => ({
        itemName: it.name,
        quantity: it.quantity,
        unitPrice: it.price,
        totalPrice: it.price * it.quantity
      })),
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      status: 'pending', // Admin must approve
      paymentStatus: paymentMethod === 'before' ? 'paid' : 'pending',
      paymentMethod: paymentMethod || 'cash'
    };

    try {
      // Send to backend
      const created = await createOrder(orderPayload);
      
      // Also store locally for tracking
      const newOrder = {
        id: created.id || `ORD-${Date.now()}`,
        type: 'menu',
        date: orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        dateTime: created.created_at || orderDate.toISOString(),
        items: menuItems,
        total: totalAmount,
        status: created.status || 'pending',
        paymentStatus: created.payment_status || 'pending',
        paymentMethod,
        paymentData: paymentData || null,
        deliveryDate: delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        estimatedDelivery: delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        tracking: {
          stage: 1,
          lastUpdate: created.created_at || orderDate.toISOString(),
          location: 'Awaiting admin approval'
        }
      };

      // Remove only the menu items from cart
      setCart(prev => prev.filter(item => item.type !== 'food'));
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      return newOrder;
    } catch (err) {
      console.error('Failed to place order:', err);
      // Fallback to local-only order if backend fails
      const fallbackOrder = {
        id: `ORD-${Date.now()}`,
        type: 'menu',
        date: orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        dateTime: orderDate.toISOString(),
        items: menuItems,
        total: totalAmount,
        status: 'pending',
        paymentStatus: paymentMethod === 'before' ? 'paid' : 'pending',
        paymentMethod,
        paymentData: paymentData || null,
        deliveryDate: delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        estimatedDelivery: delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        tracking: { stage: 1, lastUpdate: orderDate.toISOString(), location: 'Pending admin approval' }
      };
      setCart(prev => prev.filter(item => item.type !== 'food'));
      setOrders(prevOrders => [fallbackOrder, ...prevOrders]);
      return fallbackOrder;
    }
  }, [cart]);

  // Create a booking (room/hall) and attempt backend persistence + payment
  const addBooking = useCallback(async (booking, customer = {}) => {
    const orderDate = new Date();
    const localId = `BOOK-${Date.now()}`;

    const localBooking = {
      id: localId,
      type: booking.type || 'booking',
      date: orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      dateTime: orderDate.toISOString(),
      items: [booking],
      total: booking.price || 0,
      status: 'booked',
      paymentStatus: 'pending',
      paymentData: null,
      tracking: { stage: 1, lastUpdate: orderDate.toISOString(), location: 'Booking pending' }
    };

    // Optimistically add local booking
    setOrders(prev => [localBooking, ...prev]);

    try {
      // Persist booking to backend
      const createRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone })
      });
      
      if (!createRes.ok) {
        let errorMsg = 'Failed to create booking';
        try {
          const errorData = await createRes.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          errorMsg = `Server error: ${createRes.status}`;
        }
        throw new Error(errorMsg);
      }
      
      const created = await createRes.json();
      const bookingId = created.id || created.id || localId;

      // Create payment intent including bookingId metadata
      const piResp = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalPrice: booking.price || 0, customerName: customer.name || '', customerEmail: customer.email || '', bookingId })
      });
      
      if (!piResp.ok) {
        let errorMsg = 'Failed to create payment intent';
        try {
          const errorData = await piResp.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          errorMsg = `Server error: ${piResp.status}`;
        }
        throw new Error(errorMsg);
      }
      
      const piData = await piResp.json();

      // Confirm payment (backend may mock confirm when stripe not configured)
      const confirmResp = await fetch('/api/payments/confirm-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentId: piData.intentId, paymentMethodId: 'pm_card_visa' })
      });
      
      if (!confirmResp.ok) {
        let errorMsg = 'Payment confirmation failed';
        try {
          const confirmData = await confirmResp.json();
          errorMsg = confirmData.error || errorMsg;
        } catch {
          errorMsg = `Server error: ${confirmResp.status}`;
        }
        throw new Error(errorMsg);
      }
      
      const confirmData = await confirmResp.json();
      if (confirmData.status !== 'succeeded') throw new Error(confirmData.error || 'Payment failed');

      // Update booking payment status on backend
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'paid', payment_data: { chargeId: confirmData.chargeId || null, intentId: piData.intentId } })
      });

      // Update local orders list to mark paid
      setOrders(prev => prev.map(b => b.id === localId ? { ...b, id: bookingId, paymentStatus: 'paid', paymentData: { intentId: piData.intentId }, status: 'booked' } : b));
      return { ...localBooking, id: bookingId, paymentStatus: 'paid' };
    } catch (err) {
      console.error('Booking/payout failed:', err.message || err);
      // leave local booking as pending
      return localBooking;
    }
  }, []);

  const value = {
    cart,
    orders,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartTotalForType,
    getCartCountForType,
    placeMenuOrder,
    addBooking
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
