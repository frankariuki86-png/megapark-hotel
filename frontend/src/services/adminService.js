// Admin API Service - handles all admin operations (menu, rooms, halls, staff)
// Determine API base URL: prefer VITE_API_URL when provided, otherwise use relative `/api` in production and localhost in dev
const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Ensure provided VITE_API_URL points to the API root (append /api if missing)
    const clean = envUrl.replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:3000/api';
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

  async create(room, imageFiles = []) {
    // normalize legacy price field and ensure numeric types
    const payload = { ...room };
    if (payload.price !== undefined && payload.pricePerNight === undefined) {
      payload.pricePerNight = parseFloat(payload.price);
      delete payload.price;
    }
    if (payload.pricePerNight !== undefined) payload.pricePerNight = Number(payload.pricePerNight);

    const url = `${API_BASE_URL}/rooms`;
    console.log('[roomsService.create] Creating at:', url, 'data:', payload, 'files:', imageFiles.length);
    
    // Build FormData to support file uploads
    const formData = new FormData();
    
    // Add all room data fields
    formData.append('name', payload.name);
    formData.append('roomNumber', payload.roomNumber);
    formData.append('type', payload.type);
    formData.append('description', payload.description || '');
    formData.append('pricePerNight', payload.pricePerNight);
    formData.append('capacity', payload.capacity);
    formData.append('availability', payload.availability);
    if (payload.amenities && Array.isArray(payload.amenities)) {
      formData.append('amenities', JSON.stringify(payload.amenities));
    }
    
    // Add image files if provided
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        formData.append('images', file);
      }
    }

    // Get auth headers without Content-Type (let browser set it for multipart/form-data)
    const token = localStorage.getItem('__megapark_jwt__') || localStorage.getItem('adminToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
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

  async update(id, room, imageFiles = []) {
    const payload = { ...room };
    if (payload.price !== undefined && payload.pricePerNight === undefined) {
      payload.pricePerNight = parseFloat(payload.price);
      delete payload.price;
    }
    if (payload.pricePerNight !== undefined) payload.pricePerNight = Number(payload.pricePerNight);

    const url = `${API_BASE_URL}/rooms/${id}`;
    console.log('[roomsService.update] Updating at:', url, 'data:', payload, 'files:', imageFiles.length);
    
    // Build FormData to support file uploads
    const formData = new FormData();
    
    // Add all room data fields
    if (payload.name) formData.append('name', payload.name);
    if (payload.roomNumber) formData.append('roomNumber', payload.roomNumber);
    if (payload.type) formData.append('type', payload.type);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.pricePerNight !== undefined) formData.append('pricePerNight', payload.pricePerNight);
    if (payload.capacity !== undefined) formData.append('capacity', payload.capacity);
    if (payload.availability !== undefined) formData.append('availability', payload.availability);
    if (payload.amenities && Array.isArray(payload.amenities)) {
      formData.append('amenities', JSON.stringify(payload.amenities));
    }
    
    // Add image files if provided
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        formData.append('images', file);
      }
    }

    // Get auth headers without Content-Type (let browser set it for multipart/form-data)
    const token = localStorage.getItem('__megapark_jwt__') || localStorage.getItem('adminToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData
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
    const payload = { ...hall };
    if (payload.price !== undefined && payload.pricePerDay === undefined) {
      payload.pricePerDay = parseFloat(payload.price);
      delete payload.price;
    }
    if (payload.pricePerDay !== undefined) payload.pricePerDay = Number(payload.pricePerDay);

    const url = `${API_BASE_URL}/halls`;
    console.log('[hallsService.create] Creating at:', url, 'data:', payload);
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
    const payload = { ...hall };
    if (payload.price !== undefined && payload.pricePerDay === undefined) {
      payload.pricePerDay = parseFloat(payload.price);
      delete payload.price;
    }
    if (payload.pricePerDay !== undefined) payload.pricePerDay = Number(payload.pricePerDay);

    const url = `${API_BASE_URL}/halls/${id}`;
    console.log('[hallsService.update] Updating at:', url, 'data:', payload);
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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

// BOOKINGS MANAGEMENT
export const bookingsService = {
  async getAll() {
    const url = `${API_BASE_URL}/bookings`;
    console.log('[bookingsService.getAll] Fetching from:', url);
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    console.log('[bookingsService.getAll] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[bookingsService.getAll] Error:', error);
      throw new Error(error.error || 'Failed to fetch bookings');
    }
    const data = await res.json();
    console.log('[bookingsService.getAll] Success, items:', data.length);
    return data;
  },

  async update(id, bookingData) {
    const url = `${API_BASE_URL}/bookings/${id}`;
    console.log('[bookingsService.update] Updating at:', url, 'data:', bookingData);
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
    console.log('[bookingsService.update] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[bookingsService.update] Error:', error);
      throw new Error(error.error || 'Failed to update booking');
    }
    const data = await res.json();
    console.log('[bookingsService.update] Success:', data);
    return data;
  }
};

// ORDERS MANAGEMENT
export const ordersService = {
  async getAll() {
    const url = `${API_BASE_URL}/orders`;
    console.log('[ordersService.getAll] Fetching from:', url);
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    console.log('[ordersService.getAll] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[ordersService.getAll] Error:', error);
      throw new Error(error.error || 'Failed to fetch orders');
    }
    const data = await res.json();
    console.log('[ordersService.getAll] Success, items:', data.length);
    return data;
  },

  async update(id, orderData) {
    const url = `${API_BASE_URL}/orders/${id}`;
    console.log('[ordersService.update] Updating at:', url, 'data:', orderData);
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    console.log('[ordersService.update] Response status:', res.status);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('[ordersService.update] Error:', error);
      throw new Error(error.error || 'Failed to update order');
    }
    const data = await res.json();
    console.log('[ordersService.update] Success:', data);
    return data;
  }
};
