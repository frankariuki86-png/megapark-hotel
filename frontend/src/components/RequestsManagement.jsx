import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import '../styles/admin-management.css';

const RequestsManagement = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsData, ordersData] = await Promise.all([
        adminService.bookingsService.getAll().catch(() => []),
        adminService.ordersService.getAll().catch(() => [])
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError(err.message);
      setBookings([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (id) => {
    try {
      await adminService.bookingsService.update(id, { status: 'approved' });
      await fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectBooking = async (id) => {
    try {
      await adminService.bookingsService.update(id, { status: 'rejected' });
      await fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveOrder = async (id) => {
    try {
      await adminService.ordersService.update(id, { status: 'approved' });
      await fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectOrder = async (id) => {
    try {
      await adminService.ordersService.update(id, { status: 'rejected' });
      await fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: '#ff9800', label: 'Pending' },
      approved: { color: '#4caf50', label: 'Approved' },
      rejected: { color: '#f44336', label: 'Rejected' },
      completed: { color: '#2196f3', label: 'Completed' }
    };
    const style = statusMap[status] || statusMap.pending;
    return (
      <span style={{
        backgroundColor: style.color,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {style.label}
      </span>
    );
  };

  if (loading) return <div className="loading">Loading requests...</div>;

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Bookings & Orders Requests</h2>
        <button className="btn btn-secondary" onClick={fetchRequests}>🔄 Refresh</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tab Navigation */}
      <div className="request-tabs">
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          🏨 Room Bookings ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🍽️ Food Orders ({orders.filter(o => o.status === 'pending').length})
        </button>
      </div>

      {/* Room Bookings */}
      {activeTab === 'bookings' && (
        <div className="requests-list">
          <h3>Room Booking Requests</h3>
          {bookings.length === 0 ? (
            <p className="empty-state">No room bookings at the moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Room Details</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Total (KES)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => {
                  const bookingData = typeof booking.booking_data === 'string' ? JSON.parse(booking.booking_data) : booking.booking_data || {};
                  return (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.customer_name || 'N/A'}</td>
                      <td>{booking.customer_email || 'N/A'}</td>
                      <td>{booking.customer_phone || 'N/A'}</td>
                      <td>{bookingData.roomName || 'Standard Room'}</td>
                      <td>{formatDate(bookingData.checkInDate)}</td>
                      <td>{formatDate(bookingData.checkOutDate)}</td>
                      <td>KES {booking.total ? parseInt(booking.total).toLocaleString() : '0'}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td className="actions">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              className="btn-small btn-success"
                              onClick={() => handleApproveBooking(booking.id)}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="btn-small btn-danger"
                              onClick={() => handleRejectBooking(booking.id)}
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Food Orders */}
      {activeTab === 'orders' && (
        <div className="requests-list">
          <h3>Food Order Requests</h3>
          {orders.length === 0 ? (
            <p className="empty-state">No food orders at the moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Items Count</th>
                  <th>Total (KES)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
                  const itemsCount = Array.isArray(items) ? items.length : 0;
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer_name || 'N/A'}</td>
                      <td>{order.customer_email || 'N/A'}</td>
                      <td>{order.customer_phone || 'N/A'}</td>
                      <td>{order.order_type || 'dine-in'}</td>
                      <td>{itemsCount}</td>
                      <td>KES {order.total_amount ? parseInt(order.total_amount).toLocaleString() : '0'}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="actions">
                        {order.status === 'pending' && (
                          <>
                            <button
                              className="btn-small btn-success"
                              onClick={() => handleApproveOrder(order.id)}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="btn-small btn-danger"
                              onClick={() => handleRejectOrder(order.id)}
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestsManagement;
