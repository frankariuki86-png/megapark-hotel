import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const register = useCallback((email, password, firstName, lastName, phone) => {
    const newUser = {
      id: `USR-${Date.now()}`,
      email,
      firstName,
      lastName,
      phone,
      createdAt: new Date().toISOString()
    };
    
    setUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  }, []);

  const login = useCallback((email, password) => {
    // Simulate login - in production, this would call a backend API
    const loggedInUser = {
      id: `USR-${Math.random()}`,
      email,
      firstName: email.split('@')[0],
      lastName: 'User',
      phone: '+254712345678',
      createdAt: new Date().toISOString()
    };
    
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSavedAddresses([]);
    setSavedPaymentMethods([]);
  }, []);

  const addAddress = useCallback((address) => {
    const newAddress = {
      id: `ADDR-${Date.now()}`,
      ...address,
      isDefault: savedAddresses.length === 0
    };
    
    setSavedAddresses(prev => [...prev, newAddress]);
    return newAddress;
  }, [savedAddresses.length]);

  const updateAddress = useCallback((addressId, updatedAddress) => {
    setSavedAddresses(prev =>
      prev.map(addr => addr.id === addressId ? { ...addr, ...updatedAddress } : addr)
    );
  }, []);

  const deleteAddress = useCallback((addressId) => {
    setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId));
  }, []);

  const setDefaultAddress = useCallback((addressId) => {
    setSavedAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    );
  }, []);

  const addPaymentMethod = useCallback((method) => {
    const newMethod = {
      id: `PAY-${Date.now()}`,
      ...method,
      isDefault: savedPaymentMethods.length === 0
    };
    
    setSavedPaymentMethods(prev => [...prev, newMethod]);
    return newMethod;
  }, [savedPaymentMethods.length]);

  const updatePaymentMethod = useCallback((methodId, updatedMethod) => {
    setSavedPaymentMethods(prev =>
      prev.map(method => method.id === methodId ? { ...method, ...updatedMethod } : method)
    );
  }, []);

  const deletePaymentMethod = useCallback((methodId) => {
    setSavedPaymentMethods(prev => prev.filter(method => method.id !== methodId));
  }, []);

  const setDefaultPaymentMethod = useCallback((methodId) => {
    setSavedPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  }, []);

  const value = {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    register,
    login,
    logout,
    savedAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    savedPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
