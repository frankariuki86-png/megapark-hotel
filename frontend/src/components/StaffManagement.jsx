import React, { useState, useEffect } from 'react';
import { staffService } from '../services/adminService';
import '../styles/admin-management.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    isActive: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffService.getAll();
      setStaff(data);
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
      email: '',
      password: '',
      role: 'staff',
      isActive: true
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      role: user.role,
      isActive: user.isActive || user.is_active
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      
      // Only send password if it's a new user or if password field is filled
      if (editingId && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (editingId) {
        await staffService.update(editingId, dataToSend);
      } else {
        if (!dataToSend.password) {
          setError('Password is required for new staff');
          return;
        }
        await staffService.create(dataToSend);
      }
      await fetchStaff();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await staffService.updateStatus(id, !currentStatus);
      await fetchStaff();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await staffService.delete(id);
        await fetchStaff();
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading && !showForm) return <div className="loading">Loading staff...</div>;

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Staff Management</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>+ Add Staff</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit' : 'Create'} Staff Member</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password {editingId ? '(leave blank to keep current)' : '*'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!editingId}
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              Active
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
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                <td>
                  <button 
                    className={`status-btn ${user.isActive || user.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleStatus(user.id, user.isActive || user.is_active)}
                  >
                    {user.isActive || user.is_active ? '✅ Active' : '❌ Inactive'}
                  </button>
                </td>
                <td>{new Date(user.createdAt || user.created_at).toLocaleDateString()}</td>
                <td className="actions">
                  <button className="btn-small btn-edit" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="btn-small btn-delete" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && <p className="empty-state">No staff members found. Add one to get started!</p>}
      </div>
    </div>
  );
};

export default StaffManagement;
