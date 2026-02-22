import React, { useState, useEffect } from 'react';
import { menuService } from '../services/adminService';
import '../styles/admin-management.css';

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main',
    price: '',
    image: '',
    preparationTime: 20
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      description: '',
      category: 'main',
      price: '',
      image: '',
      preparationTime: 20
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await menuService.update(editingId, formData);
      } else {
        await menuService.create(formData);
      }
      await fetchItems();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuService.delete(id);
        await fetchItems();
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading && !showForm) return <div className="loading">Loading menu items...</div>;

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Menu Items Management</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>+ Add Menu Item</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit' : 'Create'} Menu Item</h3>
          
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="main">Main Course</option>
                <option value="appetizer">Appetizer</option>
                <option value="dessert">Dessert</option>
                <option value="drink">Drink</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price (KES) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div className="form-group">
              <label>Prep Time (min)</label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({...formData, preparationTime: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="items-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price (KES)</th>
              <th>Prep Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>KES {item.price.toLocaleString()}</td>
                <td>{item.preparationTime || 20} min</td>
                <td className="actions">
                  <button className="btn-small btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="btn-small btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="empty-state">No menu items found. Add one to get started!</p>}
      </div>
    </div>
  );
};

export default MenuManagement;
