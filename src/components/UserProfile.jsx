import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/account.css';

const UserProfile = () => {
  const { user, logout, savedAddresses, addAddress, deleteAddress, setDefaultAddress, savedPaymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } = useUser();
  const navigate = useNavigate();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    type: 'mpesa',
    phoneNumber: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  if (!user) {
    return (
      <div className="profile-container">
        <div className="not-logged-in">
          <h2>Please Login</h2>
          <p>You need to be logged in to access your profile.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (addressForm.fullName && addressForm.phone && addressForm.street && addressForm.city) {
      addAddress(addressForm);
      setAddressForm({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: ''
      });
      setShowAddressForm(false);
    }
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (paymentForm.type === 'mpesa' && paymentForm.phoneNumber) {
      addPaymentMethod(paymentForm);
    } else if (paymentForm.type === 'card' && paymentForm.cardNumber && paymentForm.expiryDate) {
      addPaymentMethod(paymentForm);
    } else if (paymentForm.type === 'paypal' && paymentForm.phoneNumber) {
      addPaymentMethod(paymentForm);
    }
    setPaymentForm({
      type: 'mpesa',
      phoneNumber: '',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: ''
    });
    setShowPaymentForm(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button className="btn btn-logout" onClick={() => {
          logout();
          navigate('/');
        }}>
          Logout
        </button>
      </div>

      {/* User Info Section */}
      <div className="profile-section">
        <h2>Personal Information</h2>
        <div className="user-info">
          <div className="info-item">
            <label>Name</label>
            <p>{user.firstName} {user.lastName}</p>
          </div>
          <div className="info-item">
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <p>{user.phone}</p>
          </div>
          <div className="info-item">
            <label>Member Since</label>
            <p>{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Saved Addresses Section */}
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
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                value={addressForm.street}
                onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>State/County</label>
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  value={addressForm.zipCode}
                  onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Save Address</button>
          </form>
        )}

        <div className="addresses-list">
          {savedAddresses.length === 0 ? (
            <p className="empty-message">No saved addresses yet.</p>
          ) : (
            savedAddresses.map(address => (
              <div key={address.id} className="address-card">
                {address.isDefault && <span className="default-badge">Default</span>}
                <div className="address-details">
                  <p><strong>{address.fullName}</strong> | {address.phone}</p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                </div>
                <div className="address-actions">
                  {!address.isDefault && (
                    <button className="btn-link" onClick={() => setDefaultAddress(address.id)}>Set Default</button>
                  )}
                  <button className="btn-link btn-danger" onClick={() => deleteAddress(address.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Saved Payment Methods Section */}
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
              <label>Payment Type</label>
              <select value={paymentForm.type} onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Credit/Debit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {paymentForm.type === 'mpesa' && (
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={paymentForm.phoneNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, phoneNumber: e.target.value})}
                  placeholder="+254712345678"
                  required
                />
              </div>
            )}

            {paymentForm.type === 'card' && (
              <>
                <div className="form-group">
                  <label>Card Holder Name</label>
                  <input
                    type="text"
                    value={paymentForm.cardHolder}
                    onChange={(e) => setPaymentForm({...paymentForm, cardHolder: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {paymentForm.type === 'paypal' && (
              <div className="form-group">
                <label>PayPal Email</label>
                <input
                  type="email"
                  value={paymentForm.phoneNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, phoneNumber: e.target.value})}
                  placeholder="your@email.com"
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary">Save Payment Method</button>
          </form>
        )}

        <div className="payments-list">
          {savedPaymentMethods.length === 0 ? (
            <p className="empty-message">No saved payment methods yet.</p>
          ) : (
            savedPaymentMethods.map(method => (
              <div key={method.id} className="payment-card">
                {method.isDefault && <span className="default-badge">Default</span>}
                <div className="payment-details">
                  <p className="payment-type">
                    {method.type === 'mpesa' && '📱 M-Pesa'}
                    {method.type === 'card' && '💳 Card'}
                    {method.type === 'paypal' && '🅿️ PayPal'}
                  </p>
                  {method.type === 'mpesa' && <p>{method.phoneNumber}</p>}
                  {method.type === 'card' && <p>•••• •••• •••• {method.cardNumber.slice(-4)}</p>}
                  {method.type === 'paypal' && <p>{method.phoneNumber}</p>}
                </div>
                <div className="payment-actions">
                  {!method.isDefault && (
                    <button className="btn-link" onClick={() => setDefaultPaymentMethod(method.id)}>Set Default</button>
                  )}
                  <button className="btn-link btn-danger" onClick={() => deletePaymentMethod(method.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
