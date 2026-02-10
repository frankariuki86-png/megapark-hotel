import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Plus, Edit2, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';
import '../styles/admin-users.css';

const AdminUsersPage = () => {
  const { adminUser } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff'
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('__megapark_jwt__');
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.name || (showForm && !editingId && !formData.password)) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('__megapark_jwt__');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:3000/api/admin/users/${editingId}`
        : 'http://localhost:3000/api/admin/users';

      const body = editingId
        ? { name: formData.name, role: formData.role }
        : { email: formData.email, name: formData.name, role: formData.role, password: formData.password };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Request failed: ${response.status}`);
      }

      setFormData({ email: '', password: '', name: '', role: 'staff' });
      setEditingId(null);
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('__megapark_jwt__');
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting user:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ email: '', password: '', name: '', role: 'staff' });
  };

  // Check if current user is admin
  const isAdmin = adminUser?.role === 'admin';

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <div>
          <h1>💼 Admin & Staff Users</h1>
          <p>Manage team members and their access</p>
        </div>
        {isAdmin && (
          <button 
            className="btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) setEditingId(null);
            }}
          >
            <Plus size={20} /> Add User
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {showForm && isAdmin && (
        <div className="user-form-container">
          <h3>{editingId ? 'Edit User' : 'Create New User'}</h3>
          <form onSubmit={handleAddUser} className="user-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                disabled={!!editingId}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {!editingId && (
              <div className="form-group">
                <label>Password (new user only)</label>
                <div className="password-input">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                    className="btn-icon"
                  >
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-success">
                <Check size={18} /> {editingId ? 'Update User' : 'Create User'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>No users found. Create your first admin user!</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={`user-row ${user.isActive ? 'active' : 'inactive'}`}>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td className="actions-cell">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(user)}
                        title="Edit user"
                      >
                        <Edit2 size={16} />
                      </button>
                      {adminUser?.id !== user.id && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(user.id)}
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="page-footer">
        <p className="text-muted">
          Total Users: {users.length} | Last Updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default AdminUsersPage;
