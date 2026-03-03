"use strict";

// Backend API Client with JWT Authentication
const BACKEND_URL = (() => {
  // Prefer env var (VITE_API_URL) if set - this should be the full backend URL
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleaned = envUrl.replace(/\/$/, ''); // Remove trailing slash
    console.log('[mockApi] Using VITE_API_URL from env:', cleaned);
    return cleaned;
  }
  // Development or localhost - use relative paths
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  // Production with frontend and backend on same origin - use relative paths
  return '';
})();
console.log('[mockApi] BACKEND_URL:', BACKEND_URL);
const TIMEOUT = 8000;
const TOKEN_KEY = '__megapark_jwt__';
const REFRESH_TOKEN_KEY = '__megapark_refresh__';

// Token storage helpers
const getToken = () => {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(TOKEN_KEY);
  } catch (e) {}
  return null;
};

const getRefreshToken = () => {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (e) {}
  return null;
};

const setToken = (token) => {
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}
};

const setTokens = (accessToken, refreshToken) => {
  setToken(accessToken);
  try {
    if (typeof localStorage !== 'undefined') {
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      else localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (e) {}
};

// HTTP call wrapper with exponential backoff for rate limits
const call = async (method, path, body = null, skipAuth = false, retryCount = 0) => {
  // ensure path begins with /api so even stale bundles hit correct endpoints
  const normalizedPath = path.startsWith('/api') ? path : `/api${path}`;
  const url = `${BACKEND_URL}${normalizedPath}`;
  const headers = { 'Content-Type': 'application/json' };
  
  // Add JWT token if available (except for login endpoint)
  if (path !== '/api/auth/login' && !skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] Adding auth token to', method, path);
    } else {
      console.log('[API] No token available for', method, path);
    }
  }
  
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  console.log('[API]', method, url, 'headers:', headers);
  
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Failed to fetch ${path}: Request timeout after ${TIMEOUT}ms`)), TIMEOUT);
    
    fetch(url, opts)
      .then(async res => {
        clearTimeout(timer);
        console.log('[API]', method, path, 'status:', res.status);
        const json = await res.json().catch(() => ({}));
        console.log('[API]', method, path, 'response:', json);
        
        // on 429 (rate limit), retry with exponential backoff (up to 3 times)
        if (res.status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.warn(`[API] Rate limited (429), retrying after ${delay}ms (attempt ${retryCount + 1})...`);
          setTimeout(() => {
            call(method, path, body, skipAuth, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, delay);
          return;
        }
        
        if (!res.ok) return reject(new Error(json.error || `HTTP ${res.status}`));
        resolve(json);
      })
      .catch(err => { 
        clearTimeout(timer);
        console.error(`[API Error] ${method} ${path}:`, err.message);
        reject(new Error(`Failed to fetch: ${err.message}`)); 
      });
  });
};

// Auth endpoints
export const loginAdmin = async (email, password) => {
  const result = await call('POST', '/api/auth/login', { email, password });
  if (result.accessToken && result.refreshToken) setTokens(result.accessToken, result.refreshToken);
  return result;
};

export const refreshAccessToken = async () => {
  const refreshTok = getRefreshToken();
  if (!refreshTok) throw new Error('No refresh token available');
  
  const result = await call('POST', '/api/auth/refresh', { refreshToken: refreshTok }, true);
  if (result.accessToken && result.refreshToken) {
    setTokens(result.accessToken, result.refreshToken);
  }
  return result;
};

export const logoutAdmin = async () => {
  await call('POST', '/api/auth/logout', null, true).catch(() => {});
  setTokens(null, null);
  return { message: 'Logged out' };
};

// Menu endpoints
export const fetchMenuItems = () => call('GET', '/api/menu');
export const createMenuItem = (item) => call('POST', '/api/menu', item);
export const updateMenuItemApi = (id, updates) => call('PUT', `/api/menu/${id}`, updates);
export const deleteMenuItemApi = (id) => call('DELETE', `/api/menu/${id}`);
export const updateMenuItemPrice = (id, price) => call('PUT', `/api/menu/${id}`, { price });

// Halls endpoints
export const fetchHalls = () => call('GET', '/api/halls');
export const createHall = (hall) => call('POST', '/api/halls', hall);
export const updateHallApi = (id, updates) => call('PUT', `/api/halls/${id}`, updates);
export const deleteHallApi = (id) => call('DELETE', `/api/halls/${id}`);
export const createHallQuote = (payload) => call('POST', '/api/halls/quote', payload, true);

// Rooms endpoints
export const fetchRooms = () => call('GET', '/api/rooms');
export const createRoom = (room) => call('POST', '/api/rooms', room);
export const updateRoomApi = (id, updates) => call('PUT', `/api/rooms/${id}`, updates);
export const deleteRoomApi = (id) => call('DELETE', `/api/rooms/${id}`);

// Order endpoints
export const fetchOrders = () => call('GET', '/api/orders');
export const createOrder = (order) => call('POST', '/api/orders', order);
export const updateOrderApi = (id, updates) => call('PUT', `/api/orders/${id}`, updates);

// Booking endpoints
export const fetchBookings = () => call('GET', '/api/bookings');
export const createBooking = (booking) => call('POST', '/api/bookings', booking);
export const updateBookingApi = (id, updates) => call('PUT', `/api/bookings/${id}`, updates);
// Admin User Management endpoints
// Admin User Management endpoints
export const fetchAdminUsers = () => call('GET', '/api/admin/users');
export const createAdminUser = (user) => call('POST', '/api/admin/users', user);
export const updateAdminUser = (id, updates) => call('PUT', `/api/admin/users/${id}`, updates);
export const deleteAdminUser = (id) => call('DELETE', `/api/admin/users/${id}`);
export const changeAdminPassword = (id, passwords) => call('POST', `/api/admin/users/${id}/password`, passwords);

// Payment endpoints
export const createPaymentIntent = (order) => call('POST', '/api/payments/create-intent', order);
export const confirmPaymentIntent = (intentId, paymentMethodId) => 
  call('POST', '/api/payments/confirm-intent', { intentId, paymentMethodId });
export const getPaymentIntent = (intentId) => call('GET', `/api/payments/intent/${intentId}`);

// Legacy compatibility
export const saveMenuItems = (items) => Promise.resolve(items);
export const saveOrders = (orders) => Promise.resolve(orders);

export default {
  fetchMenuItems, createMenuItem, updateMenuItemApi, deleteMenuItemApi, updateMenuItemPrice,
  fetchHalls, createHall, updateHallApi, deleteHallApi,
  createHallQuote,
  fetchRooms, createRoom, updateRoomApi, deleteRoomApi,
  fetchOrders, createOrder, updateOrderApi,
  fetchBookings, createBooking, updateBookingApi,
  loginAdmin, logoutAdmin, refreshAccessToken,
  fetchAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, changeAdminPassword,
  createPaymentIntent, confirmPaymentIntent, getPaymentIntent,
  saveMenuItems, saveOrders, getToken, setToken, getRefreshToken, setTokens
};
