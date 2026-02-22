import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import MenuManagement from './MenuManagement';
import RoomsManagement from './RoomsManagement';
import HallsManagement from './HallsManagement';
import StaffManagement from './StaffManagement';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('menu');

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-unauthorized">
        <div className="unauthorized-message">
          <h2>Access Denied</h2>
          <p>You must be an admin to access this dashboard.</p>
          <button onClick={() => navigate('/')} className="btn">Go to Home</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>📊 Megapark Admin Dashboard</h1>
          <div className="admin-user-info">
            <span>Welcome, {user.firstName || 'Admin'}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button 
          className={`admin-nav-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          🍽️ Menu Items
        </button>
        <button 
          className={`admin-nav-btn ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          🛏️ Rooms
        </button>
        <button 
          className={`admin-nav-btn ${activeTab === 'halls' ? 'active' : ''}`}
          onClick={() => setActiveTab('halls')}
        >
          🏛️ Halls
        </button>
        <button 
          className={`admin-nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          👥 Staff
        </button>
      </nav>

      {/* Content Area */}
      <main className="admin-content">
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'rooms' && <RoomsManagement />}
        {activeTab === 'halls' && <HallsManagement />}
        {activeTab === 'staff' && <StaffManagement />}
      </main>
    </div>
  );
};

export default AdminDashboard;
