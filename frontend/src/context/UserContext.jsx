import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Determine API base URL: prefer VITE_API_URL when provided, otherwise use relative `/api` in production and localhost in dev
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const base = envUrl.replace(/\/$/, '');
    return `${base}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:3000/api';
};
const API_BASE_URL = getApiBaseUrl();
console.log('[UserContext] API_BASE_URL:', API_BASE_URL);

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
  const [orderHistory, setOrderHistory] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchOrderHistory = useCallback(async (token) => {
    const tok = token || accessToken;
    if (!tok) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/mine`, {
        headers: { 'Authorization': `Bearer ${tok}` }
      });
      if (res.ok) setOrderHistory(await res.json());
    } catch (e) {
      console.warn('[UserContext] fetchOrderHistory error:', e.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [accessToken]);

  const fetchBookingHistory = useCallback(async (token) => {
    const tok = token || accessToken;
    if (!tok) return;
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/mine`, {
        headers: { 'Authorization': `Bearer ${tok}` }
      });
      if (res.ok) setBookingHistory(await res.json());
    } catch (e) {
      console.warn('[UserContext] fetchBookingHistory error:', e.message);
    }
  }, [accessToken]);

  const register = useCallback(async (email, password, firstName, lastName, phone) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/register`, {
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
        const details = Array.isArray(errorData.details)
          ? errorData.details.map(d => d.message || d).filter(Boolean).join(', ')
          : '';
        const message = details || errorData.error || 'Registration failed';
        return { ok: false, error: message };
      }
      const data = await resp.json();
      const u = data.user;
      setUser(u);

      // Auto-login after successful registration to issue access token.
      const loginResp = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (loginResp.ok) {
        const loginData = await loginResp.json();
        const at = loginData.accessToken;
        if (at) {
          localStorage.setItem('accessToken', at);
          setAccessToken(at);
          fetchOrderHistory(at);
          fetchBookingHistory(at);
        }
      }

      setIsAuthModalOpen(false);
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: err.message || 'Registration failed' };
    }
  }, [fetchBookingHistory, fetchOrderHistory]);

  const login = useCallback(async (email, password) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/login`, {
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
      fetchOrderHistory(at);
      fetchBookingHistory(at);
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: err.message || 'Login failed' };
    }
  }, [fetchBookingHistory, fetchOrderHistory]);

  const googleLogin = useCallback(async (idToken) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/google`, {
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
      fetchOrderHistory(at);
      fetchBookingHistory(at);
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: err.message || 'Google login failed' };
    }
  }, [fetchBookingHistory, fetchOrderHistory]);

  const logout = useCallback(() => {
    setUser(null);
    setSavedAddresses([]);
    setSavedPaymentMethods([]);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    setOrderHistory([]);
    setBookingHistory([]);
  }, []);

  // Auto-logout when the API signals the session has expired (e.g. refresh token also expired)
  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn('[UserContext] Session expired — logging out');
      logout();
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [logout]);

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
    orderHistory,
    bookingHistory,
    historyLoading,
    fetchOrderHistory,
    fetchBookingHistory,
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
