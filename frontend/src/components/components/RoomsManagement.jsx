import React, { useState, useEffect } from 'react';
import { roomsService } from '../services/adminService';
import '../styles/admin-management.css';

const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'standard',
    description: '',
    roomNumber: '',
    pricePerNight: '',
    capacity: 1,
    amenities: [],
    images: [],
    availability: true
  });

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
      pricePerNight: '',
      capacity: 1,
      amenities: [],
      images: [],
      availability: true
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (room) => {
    setFormData(room);
    setEditingId(room.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await roomsService.update(editingId, formData);
      } else {
        await roomsService.create(formData);
      }
      await fetchRooms();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
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

      {error && <div className="error-message">{error}</div>}

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
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
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
              <label>Price Per Night (KES) *</label>
              <input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({...formData, pricePerNight: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity *</label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
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
                <td>KES {room.pricePerNight.toLocaleString()}</td>
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
