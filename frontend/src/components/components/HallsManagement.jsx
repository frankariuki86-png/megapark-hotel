import React, { useState, useEffect } from 'react';
import { hallsService } from '../services/adminService';
import '../styles/admin-management.css';

const HallsManagement = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hallType: 'banquet',
    capacity: 100,
    area: '',
    basePrice: '',
    images: [],
    availability: true,
    packages: []
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const data = await hallsService.getAll();
      setHalls(data);
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
      hallType: 'banquet',
      capacity: 100,
      area: '',
      basePrice: '',
      images: [],
      availability: true,
      packages: []
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (hall) => {
    setFormData(hall);
    setEditingId(hall.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await hallsService.update(editingId, formData);
      } else {
        await hallsService.create(formData);
      }
      await fetchHalls();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hall?')) {
      try {
        await hallsService.delete(id);
        await fetchHalls();
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading && !showForm) return <div className="loading">Loading halls...</div>;

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Halls Management</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>+ Add Hall</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit' : 'Create'} Hall</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Hall Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Hall Type *</label>
              <select
                value={formData.hallType}
                onChange={(e) => setFormData({...formData, hallType: e.target.value})}
              >
                <option value="banquet">Banquet Hall</option>
                <option value="conference">Conference Room</option>
                <option value="pavilion">Pavilion</option>
              </select>
            </div>
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
              <label>Capacity (people) *</label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                required
              />
            </div>

            <div className="form-group">
              <label>Area (sq meters)</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                placeholder="e.g., 450 sq meters"
              />
            </div>

            <div className="form-group">
              <label>Base Price (KES) *</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.checked})}
              />
              Available
            </label>
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
              <th>Type</th>
              <th>Capacity</th>
              <th>Area</th>
              <th>Base Price (KES)</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {halls.map(hall => (
              <tr key={hall.id}>
                <td>{hall.name}</td>
                <td>{hall.hallType}</td>
                <td>{hall.capacity} people</td>
                <td>{hall.area}</td>
                <td>KES {hall.basePrice.toLocaleString()}</td>
                <td>{hall.availability ? '✅' : '❌'}</td>
                <td className="actions">
                  <button className="btn-small btn-edit" onClick={() => handleEdit(hall)}>Edit</button>
                  <button className="btn-small btn-delete" onClick={() => handleDelete(hall.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {halls.length === 0 && <p className="empty-state">No halls found. Add one to get started!</p>}
      </div>
    </div>
  );
};

export default HallsManagement;
