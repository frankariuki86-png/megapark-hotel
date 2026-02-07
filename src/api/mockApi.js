// Minimal mock API using localStorage to persist mock data between reloads
// Not wired into AdminContext automatically — can be used later to replace in-memory operations.

const KEY_MENU = 'mockapi_menu_items_v1';
const KEY_ORDERS = 'mockapi_food_orders_v1';

const wait = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

const write = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
}

export const fetchMenuItems = async () => {
  await wait(150);
  return read(KEY_MENU, []);
}

export const saveMenuItems = async (items) => {
  await wait(150);
  write(KEY_MENU, items);
  return items;
}

export const createMenuItem = async (item) => {
  const items = read(KEY_MENU, []);
  const newItem = { ...item, id: `menu-${Date.now()}`, createdAt: new Date().toISOString() };
  items.unshift(newItem);
  write(KEY_MENU, items);
  await wait(150);
  return newItem;
}

export const updateMenuItemApi = async (id, updates) => {
  const items = read(KEY_MENU, []);
  const next = items.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i);
  write(KEY_MENU, next);
  await wait(150);
  return next.find(i => i.id === id);
}

export const deleteMenuItemApi = async (id) => {
  const items = read(KEY_MENU, []);
  const next = items.filter(i => i.id !== id);
  write(KEY_MENU, next);
  await wait(120);
  return true;
}

export const fetchOrders = async () => {
  await wait(150);
  return read(KEY_ORDERS, []);
}

export const updateOrderApi = async (id, updates) => {
  const orders = read(KEY_ORDERS, []);
  const next = orders.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o);
  write(KEY_ORDERS, next);
  await wait(150);
  return next.find(o => o.id === id);
}

export default {
  fetchMenuItems, saveMenuItems, createMenuItem, updateMenuItemApi, deleteMenuItemApi, fetchOrders, updateOrderApi
};
