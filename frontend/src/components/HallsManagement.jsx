import React, { useState, useEffect } from 'react';
import { hallsService } from '../services/adminService';
import '../styles/admin-management.css';

// Resize image file to max 800x800 and return a base64 JPEG (~50-100KB each)
const resizeImageToBase64 = (file, maxSize = 800, quality = 0.78) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const HallsManagement = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [amenitiesInput, setAmenitiesInput] = useState('');
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
    setAmenitiesInput('');
    setImageFiles([]);
    setEditingId(null);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleEdit = (hall) => {
    const existingAmenities = Array.isArray(hall.amenities) ? hall.amenities : [];
    setFormData({
      name: hall.name || '',
      description: hall.description || '',
      capacity: Number(hall.capacity) || 100,
      pricePerDay: Number(hall.pricePerDay || hall.price_per_day) || 0,
      images: Array.isArray(hall.images) ? hall.images : [],
      availability: hall.availability !== undefined ? hall.availability : true,
      amenities: existingAmenities
    });
    setAmenitiesInput(existingAmenities.join(', '));
    setImageFiles([]);
    setEditingId(hall.id);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Parse amenities from the text field
    const parsedAmenities = amenitiesInput
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const payload = {
      name: formData.name,
      description: formData.description || '',
      capacity: Number(formData.capacity) || 0,
      pricePerDay: Number(formData.pricePerDay) || 0,
      images: Array.isArray(formData.images) ? formData.images : [],
      availability: formData.availability !== undefined ? formData.availability : true,
      amenities: parsedAmenities
    };

    try {
      setError(null);
      setSuccess(null);
      if (editingId) {
        console.log('[HallsManagement] Updating hall:', editingId, 'with data:', payload);
        await hallsService.update(editingId, payload, imageFiles);
        setSuccess('Hall updated successfully!');
      } else {
        console.log('[HallsManagement] Creating hall with data:', payload);
        await hallsService.create(payload, imageFiles);
        setSuccess('Hall created successfully!');
      }
      await fetchHalls();
      setShowForm(false);
    } catch (err) {
      console.error('[HallsManagement] Submit error:', err);
      setError(err.message || 'Failed to save hall');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hall?')) {
      try {
        await hallsService.delete(id);
        await fetchHalls();
        setError(null);
        setSuccess('Hall deleted.');
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

      {error && <div className="error-message">❌ {error}</div>}
      {success && <div className="success-message" style={{background:'#e8f5e9',color:'#2e7d32',padding:'10px 16px',borderRadius:'6px',marginBottom:'12px'}}>✅ {success}</div>}

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
                min="0"
                step="500"
                value={formData.pricePerDay || 0}
                onChange={(e) => setFormData({...formData, pricePerDay: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Amenities (comma-separated)</label>
            <input
              type="text"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              placeholder="e.g. AC, WiFi, Projector, Sound System"
            />
            {amenitiesInput && (
              <div style={{marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                {amenitiesInput.split(',').map(a => a.trim()).filter(a => a).map((a, i) => (
                  <span key={i} style={{background:'#e3f2fd',color:'#1565c0',padding:'2px 10px',borderRadius:'12px',fontSize:'12px'}}>
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Hall Photos (up to 5)</label>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start'}}>
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    setImageFiles(files);
                    const base64Images = await Promise.all(files.map(f => resizeImageToBase64(f)));
                    setFormData(prev => ({...prev, images: base64Images}));
                  }}
                />
                {imageFiles.length > 0 && <p style={{fontSize: '12px'}}>{imageFiles.length} file(s) selected</p>}
              </div>
              {formData.images && formData.images.filter(img => img && img.startsWith('data:')).map((img, idx) => (
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
