import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
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
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
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
      if (!contactName && nameRef.current) nameRef.current.classList.add('invalid');
      if (!contactPhone && phoneRef.current) phoneRef.current.classList.add('invalid');
      setTimeout(() => {
        if (nameRef.current) nameRef.current.classList.remove('invalid');
        if (phoneRef.current) phoneRef.current.classList.remove('invalid');
      }, 400);
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
          <label htmlFor="contact-name">Full name*</label>
          <input
            id="contact-name"
            ref={nameRef}
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            required
            aria-required="true"
          />
          <label htmlFor="contact-phone">Phone*</label>
          <input
            id="contact-phone"
            ref={phoneRef}
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            required
            aria-required="true"
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
            <Button
              type="button"
              variant="">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HallBookingPage;
