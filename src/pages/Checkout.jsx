import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import PaymentGateway from '../components/PaymentGateway';
import '../styles/checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, getCartTotalForType, getCartCountForType, placeMenuOrder, addBooking } = useCart();
  const { user, setIsAuthModalOpen } = useUser();
  const [selectedDelivery, setSelectedDelivery] = useState({});
  const [quantities, setQuantities] = useState({});
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Initialize quantities on component mount or when cart changes
  React.useEffect(() => {
    const newQuantities = {};
    cart.filter(i => i.type === 'food').forEach(item => {
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

  const [paymentMethod, setPaymentMethod] = React.useState('after');

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const handlePlaceOrder = () => {
    const foodCount = getCartCountForType('food');
    const bookingItems = cart.filter(i => i.type === 'room' || i.type === 'hall');

    if (foodCount === 0 && bookingItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!user) {
      alert('Please login before placing an order');
      setIsAuthModalOpen(true);
      return;
    }

    if (paymentMethod === 'before') {
      setIsPaymentOpen(true);
      return;
    }

    // For bookings, payment after is not allowed here
    if (bookingItems.length > 0) {
      alert('Bookings require payment before confirmation. Please choose "Pay before delivery".');
      return;
    }

    // pay after delivery (place order directly) for food only
    const order = placeMenuOrder({ paymentMethod: 'after' });
    if (order) {
      alert(`Order placed successfully! Order ID: ${order.id}`);
      navigate('/orders');
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    // place menu order with payment
    const order = placeMenuOrder({ paymentMethod: 'before', paymentData });

    // process bookings (rooms/halls)
    const bookingItems = cart.filter(i => i.type === 'room' || i.type === 'hall');
    bookingItems.forEach(item => {
      addBooking(item, paymentData);
      removeFromCart(item.id);
    });

    setIsPaymentOpen(false);
    alert(`Order placed successfully! ${order ? `Order ID: ${order.id}` : ''}`);
    navigate('/orders');
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

  const cartItems = cart;
  const foodItems = cart.filter(i => i.type === 'food');

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="page-title">Your Cart</div>
        <div className="empty-cart-message">
          <p>Your cart is empty. Start shopping!</p>
          <Link to="/" className="btn" style={{ marginTop: '20px', display: 'inline-block' }}>View Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="page-title">Review your order</div>

      <div className="checkout-grid">
        <div className="order-summary">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-container">
              <div className="delivery-date">
                {item.type === 'food' && `Delivery date: ${getDeliveryDate(item.id, selectedDelivery[item.id]).date}`}
                {item.type === 'room' && `Check-in: ${item.checkInDate} | Check-out: ${item.checkOutDate}`}
                {item.type === 'hall' && `Event: ${item.formattedDateTime}`}
              </div>

              <div className="cart-item-details-grid">
                <img className="product-image" src={item.image} alt={item.name} />

                <div className="cart-item-details">
                  <div className="product-name">{item.name}</div>
                  {item.type === 'room' && (
                    <div className="product-meta">
                      <p>Nights: {item.nights} | Guests: {item.guests}</p>
                      <p>Price per night: KES {item.roomPrice.toLocaleString()}</p>
                    </div>
                  )}
                  {item.type === 'hall' && (
                    <div className="product-meta">
                      <p>Package: {item.packageName} | Guests: {item.guestCount}</p>
                      <p>Hall: KES {item.hallPrice.toLocaleString()} + Catering: KES {item.cateringPrice.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="product-price">KES {item.price.toLocaleString()}.00</div>
                  {item.type === 'food' && (
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
                  )}
                  {(item.type === 'room' || item.type === 'hall') && (
                    <span
                      className="delete-quantity-link link-primary"
                      onClick={() => handleDelete(item.id)}
                    >
                      Remove
                    </span>
                  )}
                </div>

                {item.type === 'food' && (
                  <div className="delivery-options">
                    <div className="delivery-options-title">Delivery option:</div>
                    <div className="delivery-option">
                      <div>
                        <div className="delivery-option-date">{deliveryOptions[0].date}</div>
                        <div className="delivery-option-price">{deliveryOptions[0].price} Shipping</div>
                      </div>
                    </div>
                  </div>
                )}
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

          <div style={{ marginTop: '12px', marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Payment Method</label>
            <label style={{ marginRight: '12px' }}>
              <input type="radio" name="paymentMethod" value="after" checked={paymentMethod === 'after'} onChange={() => setPaymentMethod('after')} /> Pay after delivery
            </label>
            <label>
              <input type="radio" name="paymentMethod" value="before" checked={paymentMethod === 'before'} onChange={() => setPaymentMethod('before')} /> Pay before delivery
            </label>
          </div>

          <button className="place-order-button" onClick={handlePlaceOrder}>
            Place your order
          </button>
          {isPaymentOpen && (
            <PaymentGateway isOpen={isPaymentOpen} total={getCartTotal()} onClose={() => setIsPaymentOpen(false)} onPaymentSuccess={handlePaymentSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
