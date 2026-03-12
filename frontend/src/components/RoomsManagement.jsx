import React, { useState, useEffect } from 'react';
import { roomsService } from '../services/adminService';
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

const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'standard',
    description: '',
    roomNumber: '',
    pricePerNight: 0,
    capacity: 1,
    amenities: [],
    images: [],
    availability: true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomsService.getAll();
      setRooms(data);
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
      type: 'standard',
      description: '',
      roomNumber: '',
      pricePerNight: 5000,
      capacity: 2,
      amenities: [],
      images: [],
      availability: true
    });
    setImageFiles([]);
    setAmenitiesInput('');
    setEditingId(null);
    setError(null);
    setShowForm(true);
  };

  const handleEdit = (room) => {
    setFormData({
      name: room.name || '',
      type: room.type || 'standard',
      description: room.description || '',
      roomNumber: room.roomNumber || room.room_number || '',
      pricePerNight: Number(room.pricePerNight) || 0,
      capacity: Number(room.capacity) || 1,
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
      images: Array.isArray(room.images) ? room.images : [],
      availability: room.availability !== undefined ? room.availability : true
    });
    setImageFiles([]);
    setAmenitiesInput(Array.isArray(room.amenities) ? room.amenities.join(', ') : '');
    setEditingId(room.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmenities = amenitiesInput
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const payload = {
      name: formData.name,
      type: formData.type || 'standard',
      description: formData.description || '',
      roomNumber: formData.roomNumber,
      pricePerNight: Number(formData.pricePerNight) || 0,
      capacity: Number(formData.capacity) || 1,
      amenities: parsedAmenities,
      images: Array.isArray(formData.images) ? formData.images : [],
      availability: formData.availability !== undefined ? formData.availability : true
    };
    
    // Validate required fields on frontend first
    if (!formData.name || !formData.name.trim()) {
      setError('Room name is required');
      return;
    }
    if (!formData.roomNumber || !formData.roomNumber.trim()) {
      setError('Room number is required');
      return;
    }
    if (!formData.type) {
      setError('Room type is required');
      return;
    }
    if (formData.pricePerNight === undefined || formData.pricePerNight === null || formData.pricePerNight === '') {
      setError('Price per night is required');
      return;
    }
    if (formData.capacity === undefined || formData.capacity === null || formData.capacity === '') {
      setError('Capacity is required');
      return;
    }
    
    try {
      setError(null);
      if (editingId) {
        console.log('[RoomsManagement] Updating room:', editingId, 'with data:', payload, 'and files:', imageFiles.length);
        await roomsService.update(editingId, payload, imageFiles);
        setSuccess('Room updated successfully!');
      } else {
        console.log('[RoomsManagement] Creating room with data:', payload, 'and files:', imageFiles.length);
        await roomsService.create(payload, imageFiles);
        setSuccess('Room created successfully!');
      }
      await fetchRooms();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('[RoomsManagement] Submit error:', err);
      setError(err.message || 'Failed to save room');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomsService.delete(id);
        await fetchRooms();
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading && !showForm) return <div className="loading">Loading rooms...</div>;

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Rooms Management</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>+ Add Room</button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
      {success && <div className="success-message" style={{background:'#e8f5e9',color:'#2e7d32',padding:'10px 16px',borderRadius:'6px',marginBottom:'12px'}}>✅ {success}</div>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit' : 'Create'} Room</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Room Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Room Number *</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Type *</label>
              <input
                type="text"
                list="room-type-suggestions"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                placeholder="e.g. Standard, Suite, Executive..."
                required
              />
              <datalist id="room-type-suggestions">
                <option value="Standard" />
                <option value="Double" />
                <option value="Deluxe" />
                <option value="Suite" />
                <option value="Executive" />
                <option value="Family" />
                <option value="Penthouse" />
                <option value="Budget" />
              </datalist>
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

          <div className="form-group">
            <label>Amenities (comma-separated)</label>
            <input
              type="text"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              placeholder="e.g. Free WiFi, Air Conditioning, Smart TV"
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

          <div className="form-row">
            <div className="form-group">
              <label>Price Per Night (KES) *</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.pricePerNight || ''}
                onChange={(e) => setFormData({...formData, pricePerNight: parseFloat(e.target.value) || 0})}
                placeholder="Enter amount in KES"
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity * (guests)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.capacity || 1}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
                required
              />
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
          </div>

          <div className="form-group">
            <label>Room Photos (up to 5)</label>
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
              <th>Room #</th>
              <th>Name</th>
              <th>Type</th>
              <th>Price/Night (KES)</th>
              <th>Capacity</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td>{room.roomNumber}</td>
                <td>{room.name}</td>
                <td>{room.type}</td>
                <td>KES {(parseInt(room.pricePerNight) || 0).toLocaleString()}</td>
                <td>{room.capacity} guests</td>
                <td>{room.availability ? '✅' : '❌'}</td>
                <td className="actions">
                  <button className="btn-small btn-edit" onClick={() => handleEdit(room)}>Edit</button>
                  <button className="btn-small btn-delete" onClick={() => handleDelete(room.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && <p className="empty-state">No rooms found. Add one to get started!</p>}
      </div>
    </div>
  );
};

export default RoomsManagement;
