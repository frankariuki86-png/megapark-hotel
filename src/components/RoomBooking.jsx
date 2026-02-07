import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ImageGallery from './ImageGallery';
import ReviewSection from './ReviewSection';
import AvailabilityCalendar from './AvailabilityCalendar';
import '../styles/roombooking.css';

const BASE_URL = import.meta.env.BASE_URL || '/megapark-hotel/';
const getImagePath = (imageName) => `${BASE_URL}images/${imageName}`;

const RoomBooking = () => {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [addedMessage, setAddedMessage] = useState('');

  const rooms = [
    {
      id: 'room-standard',
      name: 'Standard Room',
      price: 5000,
      capacity: 2,
      amenities: ['Free WiFi', 'Air Conditioning', 'En-suite Bathroom', 'Flat-screen TV', 'Work Desk'],
      image: getImagePath('home1.jfif'),
      images: [getImagePath('home1.jfif'), getImagePath('home 2.jfif'), getImagePath('mega-park4.jfif')],
      description: 'Comfortable and affordable accommodation perfect for single travelers or couples.'
    },
    {
      id: 'room-deluxe',
      name: 'Deluxe Room',
      price: 8000,
      capacity: 3,
      amenities: ['Free WiFi', 'Air Conditioning', 'En-suite Bathroom', 'Flat-screen TV', 'Mini Bar', 'Safe', 'Bathrobe & Slippers'],
      image: getImagePath('home 2.jfif'),
      images: [getImagePath('home 2.jfif'), getImagePath('megapark5.jfif'), getImagePath('megapark6.jfif')],
      description: 'Spacious room with premium amenities and stunning views of the resort grounds.'
    },
    {
      id: 'room-executive',
      name: 'Executive Suite',
      price: 12000,
      capacity: 4,
      amenities: ['Free WiFi', 'Air Conditioning', 'En-suite Bathroom', 'Smart TV', 'Mini Bar', 'Safe', 'Bathrobe & Slippers', 'Jacuzzi Tub', 'Living Area', 'Premium Toiletries'],
      image: getImagePath('megapark5.jfif'),
      images: [getImagePath('megapark5.jfif'), getImagePath('megapark6.jfif'), getImagePath('home1.jfif')],
      description: 'Luxurious suite with separate living area, premium amenities, and personalized services.'
    }
  ];

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();

  const handleAddToCart = (room) => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (guests > room.capacity) {
      alert(`This room can accommodate maximum ${room.capacity} guests`);
      return;
    }

    const totalPrice = room.price * nights;

    const bookingItem = {
      id: `${room.id}-${checkInDate}-${checkOutDate}`,
      type: 'room',
      name: room.name,
      price: totalPrice,
      roomPrice: room.price,
      nights: nights,
      checkInDate,
      checkOutDate,
      guests,
      capacity: room.capacity,
      amenities: room.amenities,
      description: room.description,
      image: room.image
    };

    // add to cart and redirect to checkout for payment
    addToCart(bookingItem);
    const updatedCart = [...cart, bookingItem];
    const cartTotal = updatedCart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    setAddedMessage(`✓ ${room.name} added! Cart total: KES ${cartTotal.toLocaleString()}`);
    setTimeout(() => {
      setAddedMessage('');
      navigate('/checkout');
    }, 2000);
  };



  const getMinCheckOut = () => {
    if (!checkInDate) return '';
    const minDate = new Date(checkInDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  return (
    <section id="rooms" className="room-booking">
      <div className="room-booking-container">
        <h2>Book Your Room</h2>
        <p className="section-subtitle">Find the perfect accommodation for your stay</p>

        <div className="booking-filters">
          <div className="filter-group">
            <label htmlFor="check-in">Check-in Date</label>
            <input
              id="check-in"
              type="date"
              value={checkInDate}
              onChange={(e) => {
                setCheckInDate(e.target.value);
                if (checkOutDate && new Date(e.target.value) >= new Date(checkOutDate)) {
                  setCheckOutDate('');
                }
              }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="check-out">Check-out Date</label>
            <input
              id="check-out"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={getMinCheckOut()}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="guests">Number of Guests</label>
            <select
              id="guests"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>

        {nights > 0 && (
          <div className="booking-info">
            <p>📅 {nights} night{nights !== 1 ? 's' : ''} | 👥 {guests} guest{guests !== 1 ? 's' : ''}</p>
          </div>
        )}

        <div className="rooms-grid">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              <div className="room-image">
                <ImageGallery images={room.images} roomName={room.name} />
                <div className="room-capacity">
                  👥 Up to {room.capacity} guests
                </div>
              </div>

              <div className="room-content">
                <h3>{room.name}</h3>
                <p className="room-description">{room.description}</p>

                <div className="room-amenities">
                  <h4>Amenities</h4>
                  <ul>
                    {room.amenities.map((amenity, idx) => (
                      <li key={idx}>✓ {amenity}</li>
                    ))}
                  </ul>
                </div>

                <div className="room-pricing">
                  <span className="price-per-night">KES {room.price.toLocaleString()} / night</span>
                  {nights > 0 && (
                    <span className="total-price">
                      Total: KES {(room.price * nights).toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-book"
                  onClick={() => handleAddToCart(room)}
                  disabled={!checkInDate || !checkOutDate || guests > room.capacity}
                >
                  {guests > room.capacity ? `Max ${room.capacity} guests` : '→ Book Now'}
                </button>

                {addedMessage === `✓ ${room.name} added! Cart total: KES ${[...cart, { price: room.price * nights }].reduce((total, item) => total + (item.price * (item.quantity || 1)), 0).toLocaleString()}` && (
                  <div className="success-message">{addedMessage}</div>
                )}
              </div>

              <ReviewSection roomId={room.id} roomName={room.name} />
              <AvailabilityCalendar roomId={room.id} roomName={room.name} />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default RoomBooking;
