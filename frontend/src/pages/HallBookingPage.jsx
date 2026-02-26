import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/hallbooking.css';

const HallBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    hall,
    pkg,
    eventDate: initialDate,
    eventTime: initialTime,
    guestCount: initialGuests
  } = location.state || {};

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!hall || !pkg) {
    return (
      <div className="hall-booking-container">
        <h2>Booking form</h2>
        <p className="small">No package selected. Please pick a hall package first.</p>
        <button className="btn" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      setMessage('Please fill in the required fields.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const payload = {
        hallId: hall.id,
        hallName: hall.name,
        packageId: pkg.id,
        packageName: pkg.name,
        eventDate: initialDate,
        eventTime: initialTime,
        guestCount: initialGuests,
        contactName,
        contactPhone,
        contactEmail,
        notes
      };

      const resp = await fetch('/api/halls/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'failed');
      }

      setMessage('Quote request sent successfully!');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setNotes('');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hall-booking page-booking page-fade">
      <div className="hall-booking-container">
        <h2>Request a quotation</h2>
        <div className="event-info">
          <p><strong>Venue:</strong> {hall.name}</p>
          <p><strong>Package:</strong> {pkg.name}</p>
          {initialDate && <p><strong>Date:</strong> {initialDate}</p>}
          {initialTime && <p><strong>Time:</strong> {initialTime}</p>}
          {initialGuests && <p><strong>Guests:</strong> {initialGuests}</p>}
        </div>
        <form onSubmit={handleSubmit} className="hq-form">
          <label>Full name*</label>
          <input
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            required
          />
          <label>Phone*</label>
          <input
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            required
          />
          <label>Email</label>
          <input
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
          />
          <label>Notes / Requirements</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
          />
          {message && <p className="small" style={{ color: 'var(--text-primary)' }}>{message}</p>}
          <div className="hq-actions">
            <button
              type="button"
              className="btn"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HallBookingPage;
