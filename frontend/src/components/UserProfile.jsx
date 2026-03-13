import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/account.css';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  delivering: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  booked: 'Booked',
  completed: 'Completed',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
};

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const formatCurrency = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;

const safeParseItems = (rawItems) => {
  if (Array.isArray(rawItems)) return rawItems;
  if (typeof rawItems !== 'string') return [];
  try {
    const parsed = JSON.parse(rawItems);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* ─── Food Orders Tab ─────────────────────────────────────────────────── */
const FoodOrdersTab = ({ orders, loading, onRefresh }) => {
  if (loading) return <div className="loading-history"><span className="spinner"></span>Loading orders…</div>;
  if (!orders.length) return (
    <div className="history-empty">
      <span className="history-empty-icon">🍽️</span>
      <p>No food orders yet.</p>
      <button className="btn btn-primary" onClick={onRefresh} style={{marginTop:'12px'}}>Refresh</button>
    </div>
  );
  return (
    <div>
      {orders.map(order => {
        const items = safeParseItems(order.items);
        const status = order.status || 'pending';
        return (
          <div key={order.id} className="order-history-item">
            <div className="order-history-header">
              <div>
                <span className="order-history-id">#{order.id}</span>
                <span className="order-history-date">{formatDate(order.order_date || order.orderDate || order.created_at)}</span>
              </div>
              <span className={`order-status-badge status-${status}`}>{STATUS_LABELS[status] || status}</span>
            </div>
            <div className="order-history-items">
              {items.map((item, i) => (
                <div key={i} className="order-history-item-row">
                  <span className="order-item-name">{item.name || item.itemName || 'Item'}</span>
                  <span className="item-qty">×{item.quantity || 1}</span>
                  <span className="order-item-price">{formatCurrency((item.price || item.unitPrice || 0) * (item.quantity || 1))}</span>
                </div>
              ))}
            </div>
            <div className="order-history-footer">
              <span className="order-type-label">{order.order_type || order.orderType || 'Dine-in'}</span>
              <span className="order-total">{formatCurrency(order.total_amount || order.totalAmount)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Booking History Tab ─────────────────────────────────────────────── */
const BookingHistoryTab = ({ bookings, loading, onRefresh }) => {
  if (loading) return <div className="loading-history"><span className="spinner"></span>Loading bookings…</div>;
  if (!bookings.length) return (
    <div className="history-empty">
      <span className="history-empty-icon">🏨</span>
      <p>No bookings yet.</p>
      <button className="btn btn-primary" onClick={onRefresh} style={{marginTop:'12px'}}>Refresh</button>
    </div>
  );
  return (
    <div>
      {bookings.map(b => {
        const status = b.status || b.bookingStatus || 'booked';
        const type = b.bookingType || b.booking_type || 'room';
        return (
          <div key={b.id} className="order-history-item">
            <div className="order-history-header">
              <div>
                <span className="order-history-id">#{b.id}</span>
                <span className="order-history-date">{formatDate(b.createdAt || b.created_at)}</span>
              </div>
              <span className={`order-status-badge status-${status}`}>{STATUS_LABELS[status] || status}</span>
            </div>
            <div className="booking-history-detail">
              <div className="booking-detail-item">
                <span className="booking-detail-label">Type</span>
                <span className="booking-detail-value" style={{textTransform:'capitalize'}}>{type}</span>
              </div>
              {(b.roomName || b.hallName) && (
                <div className="booking-detail-item">
                  <span className="booking-detail-label">{type === 'hall' ? 'Hall' : 'Room'}</span>
                  <span className="booking-detail-value">{b.roomName || b.hallName}</span>
                </div>
              )}
              {b.checkIn && (
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Check-in</span>
                  <span className="booking-detail-value">{formatDate(b.checkIn)}</span>
                </div>
              )}
              {b.checkOut && (
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Check-out</span>
                  <span className="booking-detail-value">{formatDate(b.checkOut)}</span>
                </div>
              )}
              {b.eventDate && (
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Event Date</span>
                  <span className="booking-detail-value">{formatDate(b.eventDate)}</span>
                </div>
              )}
              {b.guests > 0 && (
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Guests</span>
                  <span className="booking-detail-value">{b.guests}</span>
                </div>
              )}
            </div>
            <div className="order-history-footer">
              <span className="order-type-label">{b.paymentStatus || 'pending'} payment</span>
              <span className="order-total">{formatCurrency(b.totalPrice || b.total)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────── */
const UserProfile = () => {
  const {
    user, logout,
    orderHistory, bookingHistory, historyLoading,
    fetchOrderHistory, fetchBookingHistory,
    updateProfile, changePassword,
    savedAddresses, addAddress, deleteAddress, setDefaultAddress,
    savedPaymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod
  } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '' });
  const [paymentForm, setPaymentForm] = useState({ type: 'mpesa', phoneNumber: '' });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="not-logged-in">
          <h2>Please Login</h2>
          <p>You need to be logged in to access your profile.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (addressForm.fullName && addressForm.phone && addressForm.street && addressForm.city) {
      addAddress(addressForm);
      setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '' });
      setShowAddressForm(false);
    }
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (paymentForm.phoneNumber) addPaymentMethod(paymentForm);
    setPaymentForm({ type: 'mpesa', phoneNumber: '' });
    setShowPaymentForm(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const res = await updateProfile({ name: profileForm.name, phone: profileForm.phone });
    if (!res.ok) {
      setProfileMsg(res.error || 'Failed to update profile');
      return;
    }
    setProfileMsg('Profile updated successfully.');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setProfileMsg('New password and confirm password do not match.');
      return;
    }
    const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (!res.ok) {
      setProfileMsg(res.error || 'Failed to change password');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setProfileMsg('Password changed successfully.');
  };

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-info">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h1>{displayName}</h1>
            <p style={{color:'#888', fontSize:'14px', margin:0}}>{user.email}</p>
          </div>
        </div>
        <button className="btn btn-logout" onClick={() => { logout(); navigate('/'); }}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab${activeTab === 'info' ? ' active' : ''}`}
          onClick={() => setActiveTab('info')}
        >Personal Info</button>
        <button
          className={`profile-tab${activeTab === 'orders' ? ' active' : ''}`}
          onClick={() => { setActiveTab('orders'); fetchOrderHistory(); }}
        >Food Orders{orderHistory.length > 0 && <span className="tab-badge">{orderHistory.length}</span>}</button>
        <button
          className={`profile-tab${activeTab === 'bookings' ? ' active' : ''}`}
          onClick={() => { setActiveTab('bookings'); fetchBookingHistory(); }}
        >Bookings{bookingHistory.length > 0 && <span className="tab-badge">{bookingHistory.length}</span>}</button>
        <button
          className={`profile-tab${activeTab === 'settings' ? ' active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >Saved Info</button>
      </div>

      {/* Tab Content */}
      <div className="profile-tab-content">

        {/* Personal Info */}
        {activeTab === 'info' && (
          <div className="profile-section">
            <h2>Personal Information</h2>
            {profileMsg && <p style={{color:'#0b7546', fontWeight:600}}>{profileMsg}</p>}
            <div className="user-info">
              <div className="info-item">
                <label>Full Name</label>
                <p>{displayName}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{user.phone || '—'}</p>
              </div>
              <div className="info-item">
                <label>Account Role</label>
                <p style={{textTransform:'capitalize'}}>{user.role || 'Customer'}</p>
              </div>
              {user.createdAt && (
                <div className="info-item">
                  <label>Member Since</label>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleProfileSave} className="address-form" style={{marginTop:'18px'}}>
              <h3 style={{marginTop:0}}>Update Profile</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Save Profile</button>
            </form>

            <form onSubmit={handleChangePassword} className="payment-form" style={{marginTop:'14px'}}>
              <h3 style={{marginTop:0}}>Change Password</h3>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Change Password</button>
            </form>

            <div className="profile-logout-actions">
              <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}

        {/* Food Orders */}
        {activeTab === 'orders' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Food Order History</h2>
              <button className="btn btn-small" onClick={() => fetchOrderHistory()}>Refresh</button>
            </div>
            <FoodOrdersTab orders={orderHistory} loading={historyLoading} onRefresh={fetchOrderHistory} />
            <div className="profile-logout-actions">
              <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Booking History</h2>
              <button className="btn btn-small" onClick={() => fetchBookingHistory()}>Refresh</button>
            </div>
            <BookingHistoryTab bookings={bookingHistory} loading={historyLoading} onRefresh={fetchBookingHistory} />
            <div className="profile-logout-actions">
              <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}

        {/* Saved Info (addresses + payment methods) */}
        {activeTab === 'settings' && (
          <>
            {/* Saved Addresses */}
            <div className="profile-section">
              <div className="section-header">
                <h2>Saved Addresses</h2>
                <button className="btn btn-small" onClick={() => setShowAddressForm(!showAddressForm)}>
                  {showAddressForm ? 'Cancel' : 'Add Address'}
                </button>
              </div>
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="address-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Street Address</label>
                    <input type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>State/County</label>
                      <input type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Address</button>
                </form>
              )}
              <div className="addresses-list">
                {savedAddresses.length === 0 ? (
                  <p className="empty-message">No saved addresses yet.</p>
                ) : savedAddresses.map(address => (
                  <div key={address.id} className="address-card">
                    {address.isDefault && <span className="default-badge">Default</span>}
                    <div className="address-details">
                      <p><strong>{address.fullName}</strong> | {address.phone}</p>
                      <p>{address.street}</p>
                      <p>{address.city}{address.state ? `, ${address.state}` : ''} {address.zipCode}</p>
                    </div>
                    <div className="address-actions">
                      {!address.isDefault && <button className="btn-link" onClick={() => setDefaultAddress(address.id)}>Set Default</button>}
                      <button className="btn-link btn-danger" onClick={() => deleteAddress(address.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="profile-section">
              <div className="section-header">
                <h2>Payment Methods</h2>
                <button className="btn btn-small" onClick={() => setShowPaymentForm(!showPaymentForm)}>
                  {showPaymentForm ? 'Cancel' : 'Add Payment Method'}
                </button>
              </div>
              {showPaymentForm && (
                <form onSubmit={handleAddPayment} className="payment-form">
                  <div className="form-group">
                    <label>M-Pesa Phone Number</label>
                    <input type="tel" value={paymentForm.phoneNumber} onChange={e => setPaymentForm({...paymentForm, phoneNumber: e.target.value})} placeholder="+254712345678" required />
                  </div>
                  <button type="submit" className="btn btn-primary">Save Payment Method</button>
                </form>
              )}
              <div className="payments-list">
                {savedPaymentMethods.length === 0 ? (
                  <p className="empty-message">No saved payment methods yet.</p>
                ) : savedPaymentMethods.map(method => (
                  <div key={method.id} className="payment-card">
                    {method.isDefault && <span className="default-badge">Default</span>}
                    <div className="payment-details">
                      <p className="payment-type">📱 M-Pesa</p>
                      <p>{method.phoneNumber}</p>
                    </div>
                    <div className="payment-actions">
                      {!method.isDefault && <button className="btn-link" onClick={() => setDefaultPaymentMethod(method.id)}>Set Default</button>}
                      <button className="btn-link btn-danger" onClick={() => deletePaymentMethod(method.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="profile-logout-actions">
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
