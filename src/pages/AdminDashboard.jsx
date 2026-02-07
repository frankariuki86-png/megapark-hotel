import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import '../styles/admindashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser, adminLogout, rooms, bookings, events, updateRoom, updateBooking, cancelBooking, updateEvent, cancelEvent, menuItems, addMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemPrice, toggleMenuItemAvailability, foodOrders, updateFoodOrder, cancelFoodOrder } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', description: '', category: 'mains', price: '', preparationTime: 15 });
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  if (!adminUser) {
    navigate('/admin/login');
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  // Overview Statistics
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.totalPrice : 0), 0) +
                       events.reduce((sum, e) => sum + (e.paymentStatus === 'paid' ? e.totalPrice : 0), 0);
  const pendingPayments = bookings.filter(b => b.paymentStatus === 'pending').length +
                          events.filter(e => e.paymentStatus === 'pending').length;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>📊 Admin Dashboard</h1>
          <p>Welcome, {adminUser.name}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📈 Overview
        </button>
        <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
          🛏️ Rooms
        </button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          📅 Bookings
        </button>
        <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          🎉 Events
        </button>
        <button className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
          🍽️ Menu
        </button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          📦 Food Orders
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{rooms.length}</div>
                <div className="stat-label">Total Rooms</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalBookings}</div>
                <div className="stat-label">Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">KES {totalRevenue.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{pendingPayments}</div>
                <div className="stat-label">Pending Payments</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{events.length}</div>
                <div className="stat-label">Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{rooms.filter(r => r.status === 'available').length}</div>
                <div className="stat-label">Available Rooms</div>
              </div>
            </div>

            <div className="recent-section">
              <h3>Recent Bookings</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Guest</th>
                      <th>Room</th>
                      <th>Check-in</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map(booking => (
                      <tr key={booking.id}>
                        <td><code>{booking.id}</code></td>
                        <td>{booking.guestName}</td>
                        <td>{booking.roomName}</td>
                        <td>{booking.checkIn}</td>
                        <td><span className={`status-badge ${booking.status}`}>{booking.status}</span></td>
                        <td>KES {booking.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="rooms-section">
            <h2>Room Management</h2>
            <div className="rooms-grid">
              {rooms.map(room => (
                <div key={room.id} className="room-management-card">
                  <div className="room-header">
                    <h3>{room.name}</h3>
                    <span className={`status-badge ${room.status}`}>{room.status}</span>
                  </div>
                  <div className="room-details">
                    <p><strong>Price:</strong> KES {room.price.toLocaleString()}/night</p>
                    <p><strong>Capacity:</strong> {room.capacity} guests</p>
                    <p><strong>Amenities:</strong> {room.amenities.length} items</p>
                  </div>
                  <button className="edit-btn" onClick={() => setEditingRoom(room.id)}>
                    ✏️ Edit Room
                  </button>
                </div>
              ))}
            </div>

            {editingRoom && (
              <div className="edit-modal">
                <div className="modal-content">
                  <h3>Edit Room: {rooms.find(r => r.id === editingRoom)?.name}</h3>
                  <p className="info-text">Room editing feature - connect to backend to save changes</p>
                  <button className="close-btn" onClick={() => setEditingRoom(null)}>Close</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Booking Management</h2>
            <div className="table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td><code>{booking.id}</code></td>
                      <td>{booking.guestName}</td>
                      <td>{booking.roomName}</td>
                      <td>{booking.checkIn}</td>
                      <td>{booking.checkOut}</td>
                      <td>KES {booking.totalPrice.toLocaleString()}</td>
                      <td><span className={`status-badge ${booking.status}`}>{booking.status}</span></td>
                      <td><span className={`payment-badge ${booking.paymentStatus}`}>{booking.paymentStatus}</span></td>
                      <td>
                        <button className="action-btn confirm" onClick={() => updateBooking(booking.id, { status: 'confirmed' })}>
                          ✓
                        </button>
                        <button className="action-btn cancel" onClick={() => cancelBooking(booking.id)}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="events-section">
            <h2>Event Management</h2>
            <div className="table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Guests</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      <td><code>{event.id}</code></td>
                      <td>{event.type}</td>
                      <td>{event.clientName}</td>
                      <td>{event.eventDate}</td>
                      <td>{event.guests}</td>
                      <td>KES {event.totalPrice.toLocaleString()}</td>
                      <td><span className={`status-badge ${event.status}`}>{event.status}</span></td>
                      <td><span className={`payment-badge ${event.paymentStatus}`}>{event.paymentStatus}</span></td>
                      <td>
                        <button className="action-btn confirm" onClick={() => updateEvent(event.id, { status: 'confirmed' })}>
                          ✓
                        </button>
                        <button className="action-btn cancel" onClick={() => cancelEvent(event.id)}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="menu-section">
            <div className="menu-header">
              <h2>Menu Management</h2>
              <button className="btn-add-menu" onClick={() => setShowAddMenu(!showAddMenu)}>
                {showAddMenu ? '✕ Cancel' : '+ Add Menu Item'}
              </button>
            </div>

            {showAddMenu && (
              <div className="add-menu-form">
                <h3>Add New Menu Item</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newMenuItem.description}
                    onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                  />
                  <select
                    value={newMenuItem.category}
                    onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                  >
                    <option value="appetizers">Appetizers</option>
                    <option value="mains">Mains</option>
                    <option value="sides">Sides</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Drinks</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price (KES)"
                    value={newMenuItem.price}
                    onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value)})}
                  />
                  <input
                    type="number"
                    placeholder="Prep Time (minutes)"
                    value={newMenuItem.preparationTime}
                    onChange={(e) => setNewMenuItem({...newMenuItem, preparationTime: parseInt(e.target.value)})}
                  />
                </div>
                <button className="btn-save-menu" onClick={() => {
                  if (newMenuItem.name && newMenuItem.price) {
                    addMenuItem(newMenuItem);
                    setNewMenuItem({ name: '', description: '', category: 'mains', price: '', preparationTime: 15 });
                    setShowAddMenu(false);
                  }
                }}>Save Item</button>
              </div>
            )}

            <div className="menu-grid">
              {menuItems.map(item => (
                <div key={item.id} className="menu-card">
                  <div className="menu-card-header">
                    <h4>{item.name}</h4>
                    <span className={`availability-badge ${item.availability ? 'available' : 'unavailable'}`}>
                      {item.availability ? '✓ Available' : '✕ Unavailable'}
                    </span>
                  </div>
                  <p className="menu-description">{item.description}</p>
                  <div className="menu-details">
                    <span><strong>Category:</strong> {item.category}</span>
                    <span><strong>Prep Time:</strong> {item.preparationTime} min</span>
                  </div>
                  <div className="menu-price">
                    <strong>KES {item.price.toLocaleString()}</strong>
                  </div>
                  <div className="menu-actions">
                    <input
                      type="number"
                      className="price-input"
                      placeholder="New price"
                      onBlur={(e) => {
                        if (e.target.value) {
                          updateMenuItemPrice(item.id, parseFloat(e.target.value));
                          e.target.value = '';
                        }
                      }}
                    />
                    <button className="action-btn toggle" onClick={() => toggleMenuItemAvailability(item.id)}>
                      {item.availability ? '🔒 Disable' : '🔓 Enable'}
                    </button>
                    <button className="action-btn delete" onClick={() => deleteMenuItem(item.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Food Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Food Orders Management</h2>
            <div className="orders-summary">
              <div className="order-stat">
                <span className="stat-number">{foodOrders.length}</span>
                <span className="stat-label">Total Orders</span>
              </div>
              <div className="order-stat">
                <span className="stat-number">{foodOrders.filter(o => o.status === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="order-stat">
                <span className="stat-number">{foodOrders.filter(o => o.status === 'preparing').length}</span>
                <span className="stat-label">Preparing</span>
              </div>
              <div className="order-stat">
                <span className="stat-number">{foodOrders.filter(o => o.status === 'ready').length}</span>
                <span className="stat-label">Ready</span>
              </div>
            </div>

            <div className="orders-list">
              {foodOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h4>{order.id}</h4>
                      <p className="customer-info">{order.customerName} | {order.customerPhone}</p>
                    </div>
                    <span className={`order-status ${order.status}`}>{order.status.toUpperCase()}</span>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span><strong>Type:</strong> {order.orderType}</span>
                      <span><strong>Date:</strong> {order.orderDate}</span>
                    </div>
                    {order.orderType === 'delivery' && (
                      <div className="detail-row">
                        <span><strong>Delivery Address:</strong> {order.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  <div className="order-items">
                    <strong>Items:</strong>
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.itemName} × {item.quantity} = KES {item.totalPrice.toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-total">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>KES {order.subtotal.toLocaleString()}</span>
                    </div>
                    {order.deliveryFee > 0 && (
                      <div className="total-row">
                        <span>Delivery Fee:</span>
                        <span>KES {order.deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="total-row">
                      <span>Tax:</span>
                      <span>KES {order.tax.toLocaleString()}</span>
                    </div>
                    <div className="total-row total">
                      <span><strong>Total:</strong></span>
                      <span><strong>KES {order.totalAmount.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <select
                      value={order.status}
                      onChange={(e) => updateFoodOrder(order.id, { status: e.target.value })}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button className="action-btn cancel" onClick={() => cancelFoodOrder(order.id)}>
                      Cancel Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
