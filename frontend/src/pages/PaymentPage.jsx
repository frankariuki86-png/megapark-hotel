import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import PaymentGateway from '../components/PaymentGateway';

// Determine API base URL
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const base = envUrl.replace(/\/$/, '');
    return `${base}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:3000/api';
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const booking = location.state?.booking || null;
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState('now');

  if (!booking) {
    return (
      <div style={{ padding: 20 }}>
        <h3>No booking found</h3>
        <p>Please start your booking from the rooms page.</p>
      </div>
    );
  }

  const saveBooking = async (paymentData, paymentStatus = 'paid') => {
    setIsSubmitting(true);
    try {
      // Prepare booking data for backend
      const bookingPayload = {
        customerName: user?.name || 'Guest User',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        bookingType: 'room',
        bookingData: {
          roomId: booking.room?.id || booking.id,
          checkIn: booking.checkInDate ? new Date(booking.checkInDate).toISOString() : null,
          checkOut: booking.checkOutDate ? new Date(booking.checkOutDate).toISOString() : null,
          guests: booking.guests || 1,
          nights: booking.nights || 1,
          roomName: booking.name || booking.room?.name || '',
          roomPrice: booking.roomPrice || 0,
          specialRequests: ''
        },
        total: booking.price || 0,
        paymentStatus,
        paymentData: paymentData,
        status: 'pending'
      };

      console.log('[PaymentPage] Sending booking to backend:', bookingPayload);

      // Send booking to backend
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create booking (${response.status})`);
      }

      const createdBooking = await response.json();
      console.log('[PaymentPage] Booking created successfully:', createdBooking);

      // Also store locally as backup
      try {
        localStorage.setItem(`booking-${booking.id}`, JSON.stringify({
          ...bookingPayload,
          id: createdBooking.id,
          confirmedAt: new Date().toISOString()
        }));
      } catch (e) {
        console.warn('Failed to store booking in localStorage:', e);
      }

      // notify other parts of the app (e.g., admin dashboard) about the new booking
      try {
        window.dispatchEvent(new CustomEvent('new-booking', { detail: createdBooking }));
      } catch (e) {
        console.warn('[PaymentPage] unable to dispatch new-booking event', e);
      }

      setIsOpen(false);
      alert(paymentStatus === 'paid'
        ? 'Payment successful! Your booking request has been sent to admin for approval.'
        : 'Room reserved successfully! Your booking request has been sent to admin for approval. Payment is pending.');
      navigate('/orders');
    } catch (error) {
      console.error('[PaymentPage] Error creating booking:', error);
      const prefix = paymentStatus === 'paid'
        ? 'Payment processed but failed to save booking'
        : 'Reservation failed to save booking';
      alert(`${prefix}: ${error.message}. Please contact support.`);
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    await saveBooking(paymentData, 'paid');
  };

  const handleReservePayLater = async () => {
    await saveBooking(null, 'pending');
  };

  return (
    <div style={{ minHeight: '60vh', padding: '24px 16px' }} className="page-fade">
      <h2 style={{ padding: 16 }}>Secure Payment</h2>
      <div style={{ padding: 16, maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 12 }}>
          <strong>Item:</strong> {booking.name}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Amount:</strong> KES {(booking.price || 0).toLocaleString()}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Payment Option:</strong>
          <div style={{ marginTop: 8 }}>
            <label style={{ marginRight: 16 }}>
              <input type="radio" name="roomPaymentMode" checked={paymentMode === 'later'} onChange={() => setPaymentMode('later')} /> Reserve Room, Pay Later
            </label>
            <label>
              <input type="radio" name="roomPaymentMode" checked={paymentMode === 'now'} onChange={() => setPaymentMode('now')} /> Pay Now
            </label>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {paymentMode === 'now' ? (
          <PaymentGateway
            isOpen={isOpen}
            total={booking.price || 0}
            onClose={() => setIsOpen(false)}
            onPaymentSuccess={handlePaymentSuccess}
            isDisabled={isSubmitting}
            inline
          />
        ) : (
          <div style={{ padding: 16, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10 }}>
            <p style={{ marginBottom: 12 }}>Reserve this room now and complete payment later. Admin will review and approve your booking request.</p>
            <button
              className="btn btn-primary"
              onClick={handleReservePayLater}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Reserve Room, Pay Later'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
