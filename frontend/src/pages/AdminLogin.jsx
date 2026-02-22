import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import '../styles/adminlogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    try {
      const result = await adminLogin(email, password);
      setLoading(false);

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        const errorMsg = result.error || 'Login failed. Please try again.';
        console.error('[Login Error]', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      setLoading(false);
      const errorMsg = err.message || 'Login failed. Please try again.';
      console.error('[Login Exception]', errorMsg, err);
      setError(errorMsg);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>🔐 Admin Portal</h1>
          <p>Megapark Resort Management</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@megapark.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p className="demo-credentials">
            📝 Demo Credentials:<br/>
            Email: <code>admin@megapark.com</code><br/>
            Password: <code>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
