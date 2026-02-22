import React from 'react';
import '../styles/events.css';

const EventBooking = () => {
  const handleEventSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('Event booking request:', data);
    alert('Event booking request submitted! We will contact you soon.');
    e.target.reset();
  };

  return (
    <section id="events" className="container section">
      <div className="events-header">
        <h2>Plan Your Special Event</h2>
        <p>Work with our team to create an unforgettable experience</p>
      </div>
      <div className="card">
        <p>Fill out the form below to request a quote for your event. We specialize in weddings, conferences, parties, and celebrations.</p>
        <form id="event-form" className="form-grid" onSubmit={handleEventSubmit}>
          <input name="name" placeholder="Your name" required />
          <input type="number" placeholder="Phone number" required />
          <input name="email" placeholder="Email" required />
          <input name="date" type="date" required />
          <select name="type" required>
            <option value="">Select Event Type</option>
            <option>Wedding</option>
            <option>Pre-wedding</option>
            <option>Conference</option>
            <option>Birthday Party</option>
            <option>Corporate Event</option>
            <option>Other</option>
          </select>
          <textarea name="notes" placeholder="Tell us about your event (expected guests, requirements, special requests)" rows="4"></textarea>
          <button className="btn" type="submit">Request Quote</button>
        </form>
      </div>
    </section>
  );
};

export default EventBooking;
