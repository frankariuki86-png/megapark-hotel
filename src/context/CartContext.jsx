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

  const placeOrder = useCallback(() => {
    if (cart.length === 0) return null;

    const orderId = `ORD-${Date.now()}`;
    const orderDate = new Date();
    const orderDateFormatted = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate estimated delivery date (3-5 business days)
    const estimatedDelivery = new Date(orderDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    const newOrder = {
      id: orderId,
      date: orderDateFormatted,
      dateTime: orderDate.toISOString(),
      items: [...cart],
      total: getCartTotal(),
      status: 'confirmed', // confirmed, processing, shipped, delivered
      estimatedDelivery: estimatedDelivery.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      tracking: {
        stage: 1, // 1: confirmed, 2: processing, 3: shipped, 4: delivered
        lastUpdate: orderDate.toISOString(),
        location: 'Order processing facility'
      }
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    clearCart();
    
    return newOrder;
  }, [cart, getCartTotal, clearCart]);

  const value = {
    cart,
    orders,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    placeOrder
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
