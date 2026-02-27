import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentGateway from '../components/PaymentGateway';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking || null;
  const [isOpen, setIsOpen] = useState(true);

  if (!booking) {
    return (
      <div style={{ padding: 20 }}>
        <h3>No booking found</h3>
        <p>Please start your booking from the rooms page.</p>
      </div>
    );
  }

  const handlePaymentSuccess = (paymentData) => {
    const bookingRecord = {
      ...booking,
      paymentData,
      confirmedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(`booking-${booking.id}`, JSON.stringify(bookingRecord));
    } catch (e) {}
    setIsOpen(false);
    alert('Payment successful! Your booking is confirmed.');
    navigate('/orders');
  };

  return (
    <div style={{ minHeight: '60vh' }} className="page-fade">
      <h2 style={{ padding: 16 }}>Secure Payment</h2>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <strong>Item:</strong> {booking.name}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Amount:</strong> KES {(booking.price || 0).toLocaleString()}
        </div>
      </div>
      <PaymentGateway isOpen={isOpen} total={booking.price || 0} onClose={() => setIsOpen(false)} onPaymentSuccess={handlePaymentSuccess} />
    </div>
  );
};

export default PaymentPage;
