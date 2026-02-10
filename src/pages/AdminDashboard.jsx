import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import ConfirmModal from '../components/ConfirmModal';
import { ToastProvider } from '../components/Toast';
import ChartMini from '../components/ChartMini';
import AdminUsersPage from './AdminUsers';
import '../styles/admindashboard.css';
import { Edit, Trash2, Check, X, PlusCircle, LogOut, DownloadCloud, Search } from 'lucide-react';

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
  const [editingValues, setEditingValues] = useState({});
  const menuSearchRef = useRef(null);

  // UI enhancement states
  const [menuSearch, setMenuSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMenuIds, setSelectedMenuIds] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const pushToast = (msg, type='info') => {
    if (typeof window !== 'undefined' && window.__pushToastInternal) window.__pushToastInternal(msg, type)
    else console.log('TOAST', type, msg)
  }
  // CSV export helpers
  const exportCSV = (rows, columns, filename = 'export.csv') => {
    const header = columns.join(',') + '\n';
    const body = rows.map(r => columns.map(c => {
      const v = r[c] !== undefined && r[c] !== null ? String(r[c]) : '';
      return '"' + v.replace(/"/g, '""') + '"';
    }).join(',')).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const exportMenuCSV = () => {
    const rows = filteredMenuItems.map(i => ({ id: i.id, name: i.name, description: i.description, category: i.category, price: i.price, availability: i.availability, preparationTime: i.preparationTime }));
    exportCSV(rows, ['id','name','description','category','price','availability','preparationTime'], 'menu-items.csv');
    pushToast('Menu exported as CSV', 'success');
  }

  const exportOrdersCSV = () => {
    const rows = foodOrders.map(o => ({ id: o.id, customerName: o.customerName, status: o.status, totalAmount: o.totalAmount, createdAt: o.createdAt }));
    exportCSV(rows, ['id','customerName','status','totalAmount','createdAt'], 'food-orders.csv');
    pushToast('Orders exported as CSV', 'success');
  }
  useEffect(() => { setCurrentPage(1) }, [menuSearch, itemsPerPage]);
  const filteredMenuItems = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    let items = menuItems.slice();
    if (q) items = items.filter(i => (i.name + ' ' + (i.description||'') + ' ' + i.category).toLowerCase().includes(q));
    if (sortBy === 'price') items.sort((a,b)=>a.price-b.price);
    if (sortBy === 'name') items.sort((a,b)=>a.name.localeCompare(b.name));
    return items;
  }, [menuItems, menuSearch, sortBy]);
  const totalPages = Math.max(1, Math.ceil(filteredMenuItems.length / itemsPerPage));
  const paginatedMenuItems = filteredMenuItems.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return foodOrders;
    return foodOrders.filter(o => (o.customerName + ' ' + o.id + ' ' + (o.customerPhone||'')).toLowerCase().includes(q));
  }, [foodOrders, orderSearch]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowAddMenu(v => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        menuSearchRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        exportMenuCSV();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // bulk selection helpers
  const toggleSelect = (id) => {
    setSelectedMenuIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }
  const clearSelection = () => setSelectedMenuIds(new Set());
  const selectAllOnPage = () => setSelectedMenuIds(new Set(paginatedMenuItems.map(i=>i.id)));
  const bulkDelete = () => {
    if (selectedMenuIds.size === 0) { pushToast('No items selected', 'info'); return }
    setConfirmPayload({ type: 'bulk-delete', ids: Array.from(selectedMenuIds) });
    setShowConfirm(true);
  }

  const handleConfirm = () => {
    if (!confirmPayload) return setShowConfirm(false);
    if (confirmPayload.type === 'delete') {
      deleteMenuItem(confirmPayload.id);
      pushToast('Item deleted', 'success');
    } else if (confirmPayload.type === 'bulk-delete') {
      confirmPayload.ids.forEach(id => deleteMenuItem(id));
      pushToast(`${confirmPayload.ids.length} items deleted`, 'success');
      clearSelection();
    } else if (confirmPayload.type === 'cancel-order') {
      cancelFoodOrder(confirmPayload.id);
      pushToast('Order cancelled', 'info');
    }
    setConfirmPayload(null);
    setShowConfirm(false);
  }

  const handleCancelConfirm = () => { setConfirmPayload(null); setShowConfirm(false); }

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
    <ToastProvider>
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {adminUser.name}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}><LogOut size={14} style={{marginRight:8}}/> Logout</button>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Rooms</button>
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings</button>
        <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
        <button className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>Menu</button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Food Orders</button>
        {adminUser?.role === 'admin' && (
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users</button>
        )}
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
              <div style={{display:'flex',gap:12, alignItems:'center'}}>
                <Search size={16} />
                <input ref={menuSearchRef} className="search-input" placeholder="Search menu items... (Ctrl+F)" value={menuSearch} onChange={(e)=>setMenuSearch(e.target.value)} />
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="sort-select">
                  <option value="name">Sort: Name</option>
                  <option value="price">Sort: Price</option>
                </select>
                <button className="btn-add-menu" onClick={() => setShowAddMenu(!showAddMenu)}>
                  {showAddMenu ? <><X size={14}/> Cancel</> : <><PlusCircle size={14}/> Add Menu Item</>}
                </button>
                <button className="btn-export" onClick={() => exportMenuCSV()} title="Export menu as CSV"><DownloadCloud size={16}/> Export</button>
              </div>
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
                  <div>
                    <label className="label">Image URL or Upload</label>
                    <input type="text" placeholder="Image URL (optional)" value={newMenuItem.image || ''} onChange={(e)=>setNewMenuItem({...newMenuItem, image: e.target.value})} />
                    <input type="file" accept="image/*" onChange={(e)=>{
                      const f = e.target.files && e.target.files[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = (ev)=> setNewMenuItem(prev=>({...prev, image: ev.target.result}));
                      reader.readAsDataURL(f);
                    }} />
                    {newMenuItem.image && <img src={newMenuItem.image} alt="preview" className="image-preview" />}
                  </div>
                </div>
                <button className="btn-save-menu" onClick={() => {
                  if (newMenuItem.name && newMenuItem.price) {
                    addMenuItem(newMenuItem);
                    pushToast('Menu item added', 'success');
                    setNewMenuItem({ name: '', description: '', category: 'mains', price: '', preparationTime: 15 });
                    setShowAddMenu(false);
                  } else {
                    pushToast('Please provide a name and price', 'error');
                  }
                }}>Save Item</button>
              </div>
            )}

            <div className="menu-toolbar">
              <div className="bulk-actions">
                <button onClick={selectAllOnPage} className="action-btn">Select Page</button>
                <button onClick={clearSelection} className="action-btn">Clear</button>
                <button onClick={bulkDelete} className="action-btn delete">Bulk Delete</button>
              </div>
              <div className="pagination-controls">
                <label>Per page: 
                  <select value={itemsPerPage} onChange={(e)=>setItemsPerPage(parseInt(e.target.value))}>
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                  </select>
                </label>
                <div className="pager">
                  <button disabled={currentPage===1} onClick={()=>setCurrentPage(1)}>&lt;&lt;</button>
                  <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>&lt;</button>
                  <span>Page {currentPage} / {totalPages}</span>
                  <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}>&gt;</button>
                  <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(totalPages)}>&gt;&gt;</button>
                </div>
              </div>
            </div>

            <div className="menu-grid">
              {paginatedMenuItems.map(item => (
                <div key={item.id} className={`menu-card ${editingMenuItem===item.id? 'editing':''}`}>
                  {editingMenuItem === item.id ? (
                    <div className="menu-edit-form">
                      <input value={editingValues.name || ''} onChange={(e)=>setEditingValues(prev=>({...prev, name: e.target.value}))} />
                      <input value={editingValues.description || ''} onChange={(e)=>setEditingValues(prev=>({...prev, description: e.target.value}))} />
                      <select value={editingValues.category || item.category} onChange={(e)=>setEditingValues(prev=>({...prev, category: e.target.value}))}>
                        <option value="appetizers">Appetizers</option>
                        <option value="mains">Mains</option>
                        <option value="sides">Sides</option>
                        <option value="desserts">Desserts</option>
                        <option value="drinks">Drinks</option>
                      </select>
                      <input type="number" value={editingValues.preparationTime || item.preparationTime} onChange={(e)=>setEditingValues(prev=>({...prev, preparationTime: parseInt(e.target.value)}))} />
                      <div>
                        <label className="label">Image</label>
                        <input type="text" placeholder="Image URL" value={editingValues.image || item.image || ''} onChange={(e)=>setEditingValues(prev=>({...prev, image: e.target.value}))} />
                        <input type="file" accept="image/*" onChange={(e)=>{
                          const f = e.target.files && e.target.files[0];
                          if (!f) return;
                          const reader = new FileReader();
                          reader.onload = (ev)=> setEditingValues(prev=>({...prev, image: ev.target.result}));
                          reader.readAsDataURL(f);
                        }} />
                        {(editingValues.image || item.image) && <img src={editingValues.image || item.image} alt="preview" className="image-preview" />}
                      </div>
                      <div className="edit-actions">
                        <button className="action-btn confirm" onClick={() => {
                          const updates = {
                            name: editingValues.name,
                            description: editingValues.description,
                            category: editingValues.category,
                            preparationTime: editingValues.preparationTime,
                            image: editingValues.image
                          };
                          updateMenuItem(item.id, updates);
                          pushToast('Item updated', 'success');
                          setEditingMenuItem(null);
                          setEditingValues({});
                        }}><Check size={14}/> Save</button>
                        <button className="action-btn cancel" onClick={() => { setEditingMenuItem(null); setEditingValues({}); }}><X size={14}/> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="menu-card-header">
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <input type="checkbox" checked={selectedMenuIds.has(item.id)} onChange={()=>toggleSelect(item.id)} />
                          <h4>{item.name}</h4>
                        </div>
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
                              pushToast('Price updated', 'success');
                              e.target.value = '';
                            }
                          }}
                        />
                        <button className="action-btn" onClick={() => { setEditingMenuItem(item.id); setEditingValues(item); }} title="Edit"><Edit size={14}/> Edit</button>
                        <button className="action-btn toggle" onClick={() => { toggleMenuItemAvailability(item.id); pushToast(item.availability ? 'Item disabled' : 'Item enabled', 'info') }}>
                          {item.availability ? 'Disable' : 'Enable'}
                        </button>
                        <button className="action-btn delete" onClick={() => { setConfirmPayload({ type: 'delete', id: item.id }); setShowConfirm(true); }}>
                          <Trash2 size={14}/> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Food Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Food Orders Management</h2>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:12}}>
              <input className="search-input" placeholder="Search orders by name or ID..." value={orderSearch} onChange={(e)=>setOrderSearch(e.target.value)} />
              <div style={{display:'flex',gap:8}}>
                <button className="btn-export" onClick={() => exportOrdersCSV()} title="Export orders"><DownloadCloud size={16}/> Export</button>
              </div>
            </div>
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
              {filteredOrders.map(order => (
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
                      onChange={(e) => { updateFoodOrder(order.id, { status: e.target.value }); pushToast('Order status updated', 'success') }}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button className="action-btn cancel" onClick={() => { setConfirmPayload({ type: 'cancel-order', id: order.id }); setShowConfirm(true); }}>
                      Cancel Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab (Admin Only) */}
        {activeTab === 'users' && adminUser?.role === 'admin' && (
          <AdminUsersPage />
        )}
      </div>

      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          title={confirmPayload && confirmPayload.type === 'bulk-delete' ? 'Delete items?' : confirmPayload && confirmPayload.type === 'cancel-order' ? 'Cancel Order?' : 'Delete item?'}
          message={confirmPayload && confirmPayload.type === 'bulk-delete' ? `Are you sure you want to delete ${confirmPayload.ids.length} items?` : confirmPayload && confirmPayload.type === 'cancel-order' ? 'Are you sure you want to cancel this order?' : 'This action cannot be undone.'}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
          danger={confirmPayload && (confirmPayload.type === 'bulk-delete' || confirmPayload.type === 'delete' || confirmPayload.type === 'cancel-order')}
        />
      )}
    </div>
    </ToastProvider>
  );
};

export default AdminDashboard;
