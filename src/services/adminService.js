// Admin API Service - handles all admin operations (menu, rooms, halls, staff)
// Determine API base URL - use relative paths on production, localhost in development
const API_BASE_URL = (() => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Production on Render - use relative paths
    return '/api';
  }
  // Development or custom env var
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
})();

console.log('[adminService] API_BASE_URL:', API_BASE_URL);

const getAuthHeaders = () => {
  const token = localStorage.getItem('__megapark_jwt__') || localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[adminService] Adding auth token');
  } else {
    console.log('[adminService] No token available');
  }
  return headers;
};

// MENU MANAGEMENT
export const menuService = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/menu`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch menu items');
    return res.json();
  },

  async create(item) {
    const res = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return res.json();
  },

  async update(id, item) {
    const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
    return res.json();
  }
};

// ROOMS MANAGEMENT
export const roomsService = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },

  async create(room) {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(room)
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
  },

  async update(id, room) {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(room)
    });
    if (!res.ok) throw new Error('Failed to update room');
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete room');
    return res.json();
  }
};

// HALLS MANAGEMENT
export const hallsService = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/halls`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch halls');
    return res.json();
  },

  async create(hall) {
    const res = await fetch(`${API_BASE_URL}/halls`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(hall)
    });
    if (!res.ok) throw new Error('Failed to create hall');
    return res.json();
  },

  async update(id, hall) {
    const res = await fetch(`${API_BASE_URL}/halls/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(hall)
    });
    if (!res.ok) throw new Error('Failed to update hall');
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/halls/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete hall');
    return res.json();
  }
};

// STAFF MANAGEMENT
export const staffService = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },

  async create(staffData) {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(staffData)
    });
    if (!res.ok) throw new Error('Failed to create staff');
    return res.json();
  },

  async update(id, staffData) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(staffData)
    });
    if (!res.ok) throw new Error('Failed to update staff');
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete staff');
    return res.json();
  },

  async updateStatus(id, isActive) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive })
    });
    if (!res.ok) throw new Error('Failed to update staff status');
    return res.json();
  }
};
