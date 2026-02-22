import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import HallQuoteModal from './HallQuoteModal';
import '../styles/hallbooking.css';

const BASE_URL = import.meta.env.BASE_URL || '/megapark-hotel/';
const getImagePath = (imageName) => `${BASE_URL}images/${imageName}`;

const HallBooking = () => {
  const { addBooking } = useCart();
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  const [selectedHall, setSelectedHall] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [addedMessage, setAddedMessage] = useState('');
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  // Fallback halls for when API is unavailable
  const fallbackHalls = [
    {
      id: 'hall-banquet',
      name: 'Banquet Hall',
      capacity: 300,
      area: '450 sq meters',
      image: getImagePath('mega-park4.jfif'),
      description: 'Grand banquet hall perfect for weddings, corporate events, and large celebrations.',
      basePrice: 15000,
      packages: [
        { id: 'pkg-basic', name: 'Basic', price: 15000, includes: ['Venue Rental', 'Tables & Chairs', 'Basic Lighting', '5 hrs duration'] },
        { id: 'pkg-standard', name: 'Standard', price: 25000, includes: ['Venue Rental', 'Tables & Chairs', 'Full Lighting', 'Sound System', '8 hrs duration', 'Complimentary Decoration'] },
        { id: 'pkg-premium', name: 'Premium', price: 40000, includes: ['Venue Rental', 'Tables & Chairs', 'Full AV Setup', 'Sound System', '10 hrs duration', 'Professional Decoration', 'Event Coordinator'] }
      ]
    },
    {
      id: 'hall-conference',
      name: 'Conference Room',
      capacity: 150,
      area: '250 sq meters',
      image: getImagePath('megapark6.jfif'),
      description: 'Modern conference room ideal for business meetings, seminars, and conferences.',
      basePrice: 8000,
      packages: [
        { id: 'pkg-basic', name: 'Basic', price: 8000, includes: ['Venue Rental', 'Tables & Chairs', 'Projector', '4 hrs duration'] },
        { id: 'pkg-standard', name: 'Standard', price: 12000, includes: ['Venue Rental', 'Tables & Chairs', 'Projector & Screen', 'Audio System', '6 hrs duration', 'WiFi'] },
        { id: 'pkg-premium', name: 'Premium', price: 18000, includes: ['Venue Rental', 'Tables & Chairs', 'Full AV Setup', 'Audio System', '8 hrs duration', 'WiFi', 'Tech Support'] }
      ]
    },
    {
      id: 'hall-pavilion',
      name: 'Outdoor Pavilion',
      capacity: 200,
      area: '350 sq meters',
      image: getImagePath('megapark5.jfif'),
      description: 'Beautiful outdoor venue with natural lighting, perfect for garden parties and outdoor celebrations.',
      basePrice: 12000,
      packages: [
        { id: 'pkg-basic', name: 'Basic', price: 12000, includes: ['Venue Rental', 'Tables & Chairs', 'Basic Lighting', '6 hrs duration'] },
        { id: 'pkg-standard', name: 'Standard', price: 18000, includes: ['Venue Rental', 'Tables & Chairs', 'Full Lighting', 'Sound System', '8 hrs duration', 'Decoration'] },
        { id: 'pkg-premium', name: 'Premium', price: 28000, includes: ['Venue Rental', 'Tables & Chairs', 'Full AV Setup', 'Sound System', '10 hrs duration', 'Professional Decoration', 'Event Coordinator'] }
      ]
    }
  ];

  // Fetch halls from API on component mount
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/halls', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const hallsList = Array.isArray(data) ? data : data.data || fallbackHalls;
          setHalls(hallsList.map(hall => ({
            ...hall,
            image: hall.image || getImagePath('mega-park4.jfif'),
            packages: hall.packages || [
              { id: 'pkg-basic', name: 'Basic', price: hall.basePrice || 15000, includes: ['Venue Rental', 'Tables & Chairs'] },
            ]
          })));
        } else {
          setHalls(fallbackHalls);
        }
      } catch (error) {
        console.warn('Failed to fetch halls from API, using fallback:', error);
        setHalls(fallbackHalls);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const handleRequestQuote = async (hall, pkg) => {
    if (!eventDate || !eventTime) {
      alert('Please select event date and time');
      return;
    }

    if (guestCount > hall.capacity) {
      alert(`This hall can accommodate maximum ${hall.capacity} guests`);
      return;
    }

    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const formattedDateTime = eventDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Catering calculation (KES 500 per person)
    const cateringPrice = guestCount * 500;
    const totalPrice = pkg.price + cateringPrice;

    const bookingItem = {
      id: `${hall.id}-${pkg.id}-${eventDate}-${eventTime}`,
      type: 'hall',
      name: hall.name,
      price: totalPrice,
      quantity: 1,
      hallPrice: pkg.price,
      packageName: pkg.name,
      cateringPrice: cateringPrice,
      cateringPerPerson: 500,
      eventDate: eventDate,
      eventTime: eventTime,
      formattedDateTime: formattedDateTime,
      guestCount: guestCount,
      capacity: hall.capacity,
      includes: pkg.includes,
      description: hall.description,
      image: hall.image,
      area: hall.area
    };
    // open modal flow (handled below)
    setSelectedHall(hall);
    setSelectedPackage(pkg);
    setShowQuoteModal(true);
  };

  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleSendQuote = async ({ contactName, contactPhone, contactEmail, notes }) => {
    if (!selectedHall || !selectedPackage) return;
    const payload = {
      hallId: selectedHall.id,
      hallName: selectedHall.name,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      eventDate,
      eventTime,
      guestCount,
      contactName,
      contactPhone,
      contactEmail,
      notes: notes || ''
    };

    try {
      const resp = await fetch('/api/halls/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        let errorData;
        try {
          errorData = await resp.json();
        } catch {
          errorData = { error: 'Failed to send quote request' };
        }
        throw new Error(errorData.error || 'Failed to send quote request');
      }
      const data = await resp.json();
      setAddedMessage('Your request has been sent. We will contact you with a quotation.');
      setTimeout(() => setAddedMessage(''), 5000);
      setShowQuoteModal(false);
      setSelectedHall(null);
      setSelectedPackage(null);
    } catch (err) {
      console.error(err);
      alert('Failed to send quote request. Please try again later.');
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    if (!pendingBooking) return;
    addBooking(pendingBooking, paymentData);
    setIsPaymentOpen(false);
    setAddedMessage(`${pendingBooking.name} (${pendingBooking.packageName}) booked successfully!`);
    setPendingBooking(null);
    setTimeout(() => setAddedMessage(''), 3000);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>
    <section id="halls" className="hall-booking">
      <div className="hall-booking-container">
        <h2>Book an Event Hall</h2>
        <p className="section-subtitle">Perfect venues for your special events and gatherings</p>

        <div className="event-filters">
          <div className="filter-group">
            <label htmlFor="event-date">Event Date</label>
            <input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              min={getMinDate()}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="event-time">Event Time</label>
            <input
              id="event-time"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="guest-count">Expected Guests</label>
            <input
              id="guest-count"
              type="number"
              min="1"
              max="500"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value))}
            />
          </div>
        </div>

        {eventDate && eventTime && (
          <div className="event-info">
            <p>📅 {new Date(`${eventDate}T${eventTime}`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {eventTime} | 👥 {guestCount} guests</p>
            <p className="catering-info">💰 Catering: KES 500/person × {guestCount} guests = KES {(guestCount * 500).toLocaleString()}</p>
          </div>
        )}

        <div className="halls-grid">
          {halls.map(hall => (
            <div key={hall.id} className="hall-card">
              <div className="hall-image">
                <img src={hall.image} alt={hall.name} />
                <div className="hall-capacity">
                  👥 Capacity: {hall.capacity} | 📐 {hall.area}
                </div>
              </div>

              <div className="hall-content">
                <h3>{hall.name}</h3>
                <p className="hall-description">{hall.description}</p>

                <div className="packages-section">
                  <h4>Choose Package</h4>
                  <div className="packages-list">
                    {hall.packages.map(pkg => (
                      <div key={pkg.id} className="package-option">
                        <div className="package-header">
                          <h5>{pkg.name}</h5>
                          <span className="package-base-price">KES {pkg.price.toLocaleString()}</span>
                        </div>

                        <ul className="package-includes">
                          {pkg.includes.map((item, idx) => (
                            <li key={idx}>✓ {item}</li>
                          ))}
                        </ul>

                        {eventDate && eventTime && guestCount <= hall.capacity && (
                          <div className="package-total">
                            <span>Hall: KES {pkg.price.toLocaleString()}</span>
                            <span>Catering: KES {(guestCount * 500).toLocaleString()}</span>
                            <span className="total">Total: KES {(pkg.price + guestCount * 500).toLocaleString()}</span>
                          </div>
                        )}

                        <button
                          className="btn btn-select-package"
                          onClick={() => handleRequestQuote(hall, pkg)}
                          disabled={!eventDate || !eventTime || guestCount > hall.capacity}
                        >
                          {guestCount > hall.capacity ? `Max ${hall.capacity} guests` : 'Request Quote'}
                        </button>

                        {addedMessage && (
                          <div className="success-message">{addedMessage}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
      {isPaymentOpen && (
        <PaymentGateway
          isOpen={isPaymentOpen}
          total={pendingBooking ? pendingBooking.price : 0}
          onClose={() => setIsPaymentOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      <HallQuoteModal isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} onSubmit={handleSendQuote} initial={{}} />
    </>
  );
};

export default HallBooking;
