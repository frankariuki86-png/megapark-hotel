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

  if (!booking) {
    return (
      <div style={{ padding: 20 }}>
        <h3>No booking found</h3>
        <p>Please start your booking from the rooms page.</p>
      </div>
    );
  }

  const handlePaymentSuccess = async (paymentData) => {
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
        paymentStatus: 'paid',
        paymentData: paymentData,
        status: 'booked'
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
      alert('Payment successful! Your booking is confirmed and sent to admin for approval.');
      navigate('/orders');
    } catch (error) {
      console.error('[PaymentPage] Error creating booking:', error);
      alert(`Payment processed but failed to save booking: ${error.message}. Please contact support.`);
      setIsSubmitting(false);
    }
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
      <PaymentGateway isOpen={isOpen} total={booking.price || 0} onClose={() => setIsOpen(false)} onPaymentSuccess={handlePaymentSuccess} isDisabled={isSubmitting} />
    </div>
  );
};

export default PaymentPage;
