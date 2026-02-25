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
    const url = `${API_BASE_URL}/menu`;
    console.log('[menuService.getAll] Fetching from:', url);
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    console.log('[menuService.getAll] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[menuService.getAll] Error:', error);
      throw new Error(error.error || 'Failed to fetch menu items');
    }
    const data = await res.json();
    console.log('[menuService.getAll] Success, items:', data.length);
    return data;
  },

  async create(item) {
    const url = `${API_BASE_URL}/menu`;
    console.log('[menuService.create] Creating at:', url, 'data:', item);
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    console.log('[menuService.create] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[menuService.create] Error:', error);
      throw new Error(error.error || 'Failed to create menu item');
    }
    const data = await res.json();
    console.log('[menuService.create] Success:', data);
    return data;
  },

  async update(id, item) {
    const url = `${API_BASE_URL}/menu/${id}`;
    console.log('[menuService.update] Updating at:', url, 'data:', item);
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    console.log('[menuService.update] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[menuService.update] Error:', error);
      throw new Error(error.error || 'Failed to update menu item');
    }
    const data = await res.json();
    console.log('[menuService.update] Success:', data);
    return data;
  },

  async delete(id) {
    const url = `${API_BASE_URL}/menu/${id}`;
    console.log('[menuService.delete] Deleting at:', url);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    console.log('[menuService.delete] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[menuService.delete] Error:', error);
      throw new Error(error.error || 'Failed to delete menu item');
    }
    const data = await res.json().catch(() => ({}));
    console.log('[menuService.delete] Success');
    return data;
  }
};

// ROOMS MANAGEMENT
export const roomsService = {
  async getAll() {
    const url = `${API_BASE_URL}/rooms`;
    console.log('[roomsService.getAll] Fetching from:', url);
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    console.log('[roomsService.getAll] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[roomsService.getAll] Error:', error);
      throw new Error(error.error || 'Failed to fetch rooms');
    }
    const data = await res.json();
    console.log('[roomsService.getAll] Success, items:', data.length);
    return data;
  },

  async create(room) {
    const url = `${API_BASE_URL}/rooms`;
    console.log('[roomsService.create] Creating at:', url, 'data:', room);
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(room)
    });
    console.log('[roomsService.create] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[roomsService.create] Error:', error);
      throw new Error(error.error || 'Failed to create room');
    }
    const data = await res.json();
    console.log('[roomsService.create] Success:', data);
    return data;
  },

  async update(id, room) {
    const url = `${API_BASE_URL}/rooms/${id}`;
    console.log('[roomsService.update] Updating at:', url, 'data:', room);
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(room)
    });
    console.log('[roomsService.update] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[roomsService.update] Error:', error);
      throw new Error(error.error || 'Failed to update room');
    }
    const data = await res.json();
    console.log('[roomsService.update] Success:', data);
    return data;
  },

  async delete(id) {
    const url = `${API_BASE_URL}/rooms/${id}`;
    console.log('[roomsService.delete] Deleting at:', url);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    console.log('[roomsService.delete] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[roomsService.delete] Error:', error);
      throw new Error(error.error || 'Failed to delete room');
    }
    const data = await res.json().catch(() => ({}));
    console.log('[roomsService.delete] Success');
    return data;
  }
};

// HALLS MANAGEMENT
export const hallsService = {
  async getAll() {
    const url = `${API_BASE_URL}/halls`;
    console.log('[hallsService.getAll] Fetching from:', url);
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    console.log('[hallsService.getAll] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[hallsService.getAll] Error:', error);
      throw new Error(error.error || 'Failed to fetch halls');
    }
    const data = await res.json();
    console.log('[hallsService.getAll] Success, items:', data.length);
    return data;
  },

  async create(hall) {
    const url = `${API_BASE_URL}/halls`;
    console.log('[hallsService.create] Creating at:', url, 'data:', hall);
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(hall)
    });
    console.log('[hallsService.create] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[hallsService.create] Error:', error);
      throw new Error(error.error || 'Failed to create hall');
    }
    const data = await res.json();
    console.log('[hallsService.create] Success:', data);
    return data;
  },

  async update(id, hall) {
    const url = `${API_BASE_URL}/halls/${id}`;
    console.log('[hallsService.update] Updating at:', url, 'data:', hall);
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(hall)
    });
    console.log('[hallsService.update] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[hallsService.update] Error:', error);
      throw new Error(error.error || 'Failed to update hall');
    }
    const data = await res.json();
    console.log('[hallsService.update] Success:', data);
    return data;
  },

  async delete(id) {
    const url = `${API_BASE_URL}/halls/${id}`;
    console.log('[hallsService.delete] Deleting at:', url);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    console.log('[hallsService.delete] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[hallsService.delete] Error:', error);
      throw new Error(error.error || 'Failed to delete hall');
    }
    const data = await res.json().catch(() => ({}));
    console.log('[hallsService.delete] Success');
    return data;
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
