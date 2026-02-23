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
    capacity: 100,
    pricePerDay: 0,
    images: [],
    availability: true,
    amenities: []
  });
  const [imageFiles, setImageFiles] = useState([]);

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
      capacity: 100,
      pricePerDay: 0,
      images: [],
      availability: true,
      amenities: []
    });
    setImageFiles([]);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (hall) => {
    setFormData({
      ...hall,
      capacity: Number(hall.capacity) || 100,
      pricePerDay: Number(hall.pricePerDay) || 0
    });
    setImageFiles([]);
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
                value={formData.capacity || 100}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 100})}
                required
              />
            </div>

            <div className="form-group">
              <label>Price Per Day (KES) *</label>
              <input
                type="number"
                value={formData.pricePerDay || 0}
                onChange={(e) => setFormData({...formData, pricePerDay: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Hall Photos (up to 5)</label>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start'}}>
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    setImageFiles(files);
                    Promise.all(files.map(file => {
                      return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                      });
                    })).then(images => {
                      setFormData({...formData, images});
                    });
                  }}
                />
                {imageFiles.length > 0 && <p style={{fontSize: '12px'}}>{imageFiles.length} file(s) selected</p>}
              </div>
              {formData.images && formData.images.map((img, idx) => (
                <img key={idx} src={img} alt={`preview-${idx}`} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}} />
              ))}
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
              <th>Amenities</th>
              <th>Price/Day (KES)</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {halls.map(hall => (
              <tr key={hall.id}>
                <td>{hall.name}</td>
                <td>Hall</td>
                <td>{hall.capacity} people</td>
                <td>{hall.amenities && hall.amenities.length > 0 ? hall.amenities.length : '0'}</td>
                <td>KES {(hall.pricePerDay || 0).toLocaleString()}</td>
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
