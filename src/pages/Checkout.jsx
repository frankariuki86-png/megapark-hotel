import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, getCartTotal, placeOrder } = useCart();
  const [selectedDelivery, setSelectedDelivery] = useState({});
  const [quantities, setQuantities] = useState({});

  // Initialize quantities on component mount or when cart changes
  React.useEffect(() => {
    const newQuantities = {};
    cart.forEach(item => {
      newQuantities[item.id] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [cart]);

  const handleQuantityChange = (itemId, newQuantity) => {
    const parsedQty = parseInt(newQuantity);
    if (parsedQty > 0) {
      setQuantities(prev => ({
        ...prev,
        [itemId]: parsedQty
      }));
      updateCartItem(itemId, parsedQty);
    }
  };

  const handleDelete = (itemId) => {
    removeFromCart(itemId);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    const order = placeOrder();
    if (order) {
      alert(`Order placed successfully! Order ID: ${order.id}`);
      navigate('/orders');
    }
  };

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const deliveryOptions = [
    { date: todayFormatted, price: 'FREE', label: 'Standard Delivery' }
  ];

  const getDeliveryDate = (itemId) => {
    return deliveryOptions[0];
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="page-title">Your Cart</div>
        <div className="empty-cart-message">
          <p>Your cart is empty. Start shopping!</p>
          <a href="/#menu" className="btn" style={{ marginTop: '20px' }}>View Menu</a>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="page-title">Review your order</div>

      <div className="checkout-grid">
        <div className="order-summary">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-container">
              <div className="delivery-date">
                Delivery date: {getDeliveryDate(item.id, selectedDelivery[item.id]).date}
              </div>

              <div className="cart-item-details-grid">
                <img className="product-image" src={item.image} alt={item.name} />

                <div className="cart-item-details">
                  <div className="product-name">{item.name}</div>
                  <div className="product-price">KES {item.price.toLocaleString()}.00</div>
                  <div className="product-quantity">
                    <span>
                      Quantity: 
                      <input 
                        type="number" 
                        min="1" 
                        value={quantities[item.id] || item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        style={{ width: '60px', padding: '4px 8px', marginLeft: '8px' }}
                      />
                    </span>
                    <span
                      className="delete-quantity-link link-primary"
                      onClick={() => handleDelete(item.id)}
                      style={{ marginLeft: '12px' }}
                    >
                      Delete
                    </span>
                  </div>
                </div>

                <div className="delivery-options">
                  <div className="delivery-options-title">Delivery option:</div>
                  <div className="delivery-option">
                    <div>
                      <div className="delivery-option-date">{deliveryOptions[0].date}</div>
                      <div className="delivery-option-price">{deliveryOptions[0].price} Shipping</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="payment-summary">
          <div className="payment-summary-title">Payment Summary</div>

          <div className="payment-summary-row">
            <div>Subtotal:</div>
            <div className="payment-summary-money">KES {getCartTotal().toLocaleString()}.00</div>
          </div>

          <div className="payment-summary-row subtotal-row">
            <div>Shipping:</div>
            <div className="payment-summary-money">KES 0.00</div>
          </div>

          <div className="payment-summary-row total-row">
            <div>Order total:</div>
            <div className="payment-summary-money">KES {getCartTotal().toLocaleString()}.00</div>
          </div>

          <button className="place-order-button" onClick={handlePlaceOrder}>
            Place your order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
