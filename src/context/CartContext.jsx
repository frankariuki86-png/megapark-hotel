import React, { createContext, useContext, useState, useCallback } from 'react';

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

  // Place an order for menu (food) items only. If paymentMethod is 'before',
  // paymentData should be provided and paymentStatus will be 'paid'. For
  // 'after', paymentStatus will be 'pending'. Delivery is free; deliveryDate
  // defaults to today.
  const placeMenuOrder = useCallback(({ paymentMethod = 'after', paymentData = null, deliveryDate = null } = {}) => {
    const menuItems = cart.filter(item => item.type === 'food');
    if (menuItems.length === 0) return null;

    const orderId = `ORD-${Date.now()}`;
    const orderDate = new Date();
    const orderDateFormatted = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const delivery = deliveryDate ? new Date(deliveryDate) : orderDate;

    const newOrder = {
      id: orderId,
      type: 'menu',
      date: orderDateFormatted,
      dateTime: orderDate.toISOString(),
      items: menuItems,
      total: menuItems.reduce((t, it) => t + (it.price * it.quantity), 0),
      status: paymentMethod === 'before' ? 'confirmed' : 'processing',
      paymentMethod,
      paymentStatus: paymentMethod === 'before' ? 'paid' : 'pending',
      paymentData: paymentData || null,
      deliveryDate: delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      estimatedDelivery: delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      tracking: {
        stage: paymentMethod === 'before' ? 1 : 1,
        lastUpdate: orderDate.toISOString(),
        location: 'Order processing facility'
      }
    };

    // remove only the menu items from the cart
    setCart(prev => prev.filter(item => item.type !== 'food'));
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    return newOrder;
  }, [cart]);

  // Create a booking (room/hall) after successful payment
  const addBooking = useCallback((booking, paymentData = null) => {
    const orderId = `BOOK-${Date.now()}`;
    const orderDate = new Date();

    const newBooking = {
      id: orderId,
      type: booking.type || 'booking',
      date: orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      dateTime: orderDate.toISOString(),
      items: [booking],
      total: booking.price || 0,
      status: 'booked',
      paymentStatus: paymentData ? 'paid' : 'pending',
      paymentData: paymentData || null,
      tracking: { stage: 1, lastUpdate: orderDate.toISOString(), location: 'Booking confirmed' }
    };

    setOrders(prev => [newBooking, ...prev]);
    return newBooking;
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
