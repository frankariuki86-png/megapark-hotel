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
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const register = useCallback(async (email, password, firstName, lastName, phone) => {
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, phone })
      });
      if (!resp.ok) {
        let errorData;
        try {
          errorData = await resp.json();
        } catch {
          errorData = {};
        }
        return { ok: false, error: errorData.error || 'Registration failed' };
      }
      const data = await resp.json();
      const u = data.user;
      setUser(u);
      setIsAuthModalOpen(false);
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: err.message || 'Registration failed' };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!resp.ok) {
        let errorData;
        try {
          errorData = await resp.json();
        } catch {
          errorData = {};
        }
        return { ok: false, error: errorData.error || 'Login failed' };
      }
      const data = await resp.json();
      const { accessToken: at, user: u } = data;
      if (at) {
        localStorage.setItem('accessToken', at);
        setAccessToken(at);
      }
      setUser(u);
      setIsAuthModalOpen(false);
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: err.message || 'Login failed' };
    }
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    try {
      const resp = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      if (!resp.ok) {
        let errorData;
        try {
          errorData = await resp.json();
        } catch {
          errorData = {};
        }
        return { ok: false, error: errorData.error || 'Google login failed' };
      }
      const data = await resp.json();
      const { accessToken: at, user: u } = data;
      if (at) {
        localStorage.setItem('accessToken', at);
        setAccessToken(at);
      }
      setUser(u);
      setIsAuthModalOpen(false);
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: err.message || 'Google login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSavedAddresses([]);
    setSavedPaymentMethods([]);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
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
    googleLogin,
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
