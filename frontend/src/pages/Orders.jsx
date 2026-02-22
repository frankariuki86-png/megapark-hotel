import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/orders.css';

const Orders = () => {
  const { orders, addToCart } = useCart();
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleAddToCart = (item) => {
    addToCart(item);
    alert(`${item.name} added to cart!`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': '#FFA500',
      'processing': '#1E90FF',
      'shipped': '#4169E1',
      'delivered': '#28A745'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (stage) => {
    const icons = {
      1: '✓',
      2: '⚙',
      3: '🚚',
      4: '✓'
    };
    return icons[stage] || '?';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'confirmed': 'Order Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    return labels[status] || 'Unknown';
  };

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="main">
          <div className="page-title">Your Orders</div>
          <div className="empty-orders-message">
            <p>You haven't placed any orders yet.</p>
            <Link to="/" className="btn" style={{ marginTop: '20px', display: 'inline-block' }}>Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

  return (
    <div className="orders-page">
      <div className="main">
        <div className="page-title">Your Orders</div>

        {orders.map((order) => (
          <div key={order.id} className="order-container">
            <div className="order-header">
              <div className="order-header-left-section">
                <div className="order-date">
                  <div className="order-label">Order Placed:</div>
                  <div className="order-value">{order.date}</div>
                </div>
                <div className="order-total">
                  <div className="order-label">Total:</div>
                  <div className="order-value">KES {order.total.toLocaleString()}.00</div>
                </div>
              </div>
              <div className="order-header-right-section">
                <div className="order-id">
                  <div className="order-label">Order ID:</div>
                  <div className="order-value" style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                    {order.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="order-status-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: getStatusColor(order.status) }}>Status: {getStatusLabel(order.status)}</strong>
              </div>
              <div className="tracking-timeline" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {[1, 2, 3, 4].map((stage) => (
                  <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        backgroundColor: order.tracking.stage >= stage ? getStatusColor(order.status) : '#ddd',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}
                    >
                      {getStatusIcon(stage)}
                    </div>
                    <small style={{ fontSize: '12px', textAlign: 'center' }}>
                      {stage === 1 && 'Confirmed'}
                      {stage === 2 && 'Processing'}
                      {stage === 3 && 'Shipped'}
                      {stage === 4 && 'Delivered'}
                    </small>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
                <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                <strong>Last Update:</strong> {new Date(order.tracking.lastUpdate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="order-details-grid">
              {order.items.map((item) => (
                <React.Fragment key={item.id}>
                  <div className="product-image-container">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="product-details">
                    <div className="product-name">{item.name}</div>
                    <div className="product-arrival-date">
                      Arriving on: {order.estimatedDelivery}
                    </div>
                    <div className="product-quantity">Quantity: {item.quantity}</div>
                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                      <strong>Price: KES {item.price.toLocaleString()}</strong>
                    </div>
                    <button
                      className="add-to-cart-button"
                      onClick={() => handleAddToCart(item)}
                      style={{ marginTop: '8px' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                  <div className="product-actions">
                    <button
                      className="track-package-link"
                      onClick={() => setSelectedOrderId(order.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '14px',
                        fontWeight: '600',
                        padding: 0
                      }}
                    >
                      📍 Track Order
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedOrderId(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0b7546' }}>📍 Track Your Order</h2>
              <button
                onClick={() => setSelectedOrderId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Order ID:</strong> {selectedOrder.id}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Order Date:</strong> {selectedOrder.date}
              </div>
              <div>
                <strong style={{ color: getStatusColor(selectedOrder.status) }}>
                  Status: {getStatusLabel(selectedOrder.status)}
                </strong>
              </div>
            </div>

            <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>Delivery Timeline</h3>
            <div style={{ marginBottom: '20px' }}>
              {[
                { stage: 1, label: 'Order Confirmed', icon: '✓' },
                { stage: 2, label: 'Processing Order', icon: '⚙' },
                { stage: 3, label: 'Out for Delivery', icon: '🚚' },
                { stage: 4, label: 'Delivered', icon: '✓' }
              ].map((step, index) => (
                <div key={step.stage} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: selectedOrder.tracking.stage >= step.stage ? getStatusColor(selectedOrder.status) : '#ddd',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{step.label}</div>
                      {selectedOrder.tracking.stage >= step.stage && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          ✓ Completed
                          {step.stage === selectedOrder.tracking.stage && (
                            <span> (Current)</span>
                          )}
                        </div>
                      )}
                      {selectedOrder.tracking.stage < step.stage && (
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          Pending
                        </div>
                      )}
                    </div>
                  </div>
                  {index < 3 && (
                    <div
                      style={{
                        marginLeft: '14px',
                        marginTop: '5px',
                        marginBottom: '5px',
                        width: '2px',
                        height: '20px',
                        backgroundColor: selectedOrder.tracking.stage > step.stage ? getStatusColor(selectedOrder.status) : '#ddd'
                      }}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>📍 Current Location:</strong>
              </div>
              <div style={{ color: '#666', marginBottom: '10px' }}>
                {selectedOrder.tracking.location}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                Last updated: {new Date(selectedOrder.tracking.lastUpdate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <strong>Items in this order:</strong>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                {selectedOrder.items.map((item) => (
                  <li key={item.id} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    {item.name} x{item.quantity} - KES {(item.price * item.quantity).toLocaleString()}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '15px', fontSize: '16px', fontWeight: 'bold', color: '#0b7546' }}>
                Total: KES {selectedOrder.total.toLocaleString()}.00
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSelectedOrderId(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Contact support at +254 711 768 878 for assistance with order ${selectedOrder.id}`);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#28A745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
