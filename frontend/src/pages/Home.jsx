import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import RoomBooking from '../components/RoomBooking';
import HallBooking from '../components/HallBooking';
import EventBooking from '../components/EventBooking';
import '../styles/home.css';

const BASE_URL = import.meta.env.BASE_URL || '/megapark-hotel/';
const getImagePath = (imageName) => `${BASE_URL}images/${imageName}`;

const Home = () => {
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [halls, setHalls] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const slides = [
    {
      image: getImagePath('home1.jfif'),
      title: 'Welcome to Megapark Resort.',
      description: 'Relax in comfort, enjoy authentic Kenyan cuisine, and create unforgettable memories.',
      ctaText: 'Explore the Resort',
      ctaLink: '#about'
    },
    {
      image: getImagePath('megapark5.jfif'),
      title: 'Fine Dining & Events',
      description: 'Catering for weddings, conferences and private events with professional service.',
      ctaText: 'View Menu',
      ctaLink: '#menu'
    }
  ];

  const fallbackMenuItems = [
    { id: 'nyama-choma', name: 'Nyama Choma', description: 'Grilled Kenyan beef served with ugali and kachumbari.', price: 1200, image: getImagePath('Nyama-Choma-1-1080x1080.jpg.webp') },
    { id: 'chapati-nyama', name: 'Chapati & Nyama', description: 'Classic chapati meal with meat and greens.', price: 1000, image: getImagePath('chapati nyama.png') }
  ];

  const fallbackHalls = [
    { id: 'banquet', name: 'Banquet Hall', description: 'Spacious hall for weddings and large events.', image: getImagePath('hall 1.webp') }
  ];

  const fallbackRooms = [
    { id: 'standard', name: 'Standard Room', description: 'Comfortable room with essential amenities.', price: 5000, image: getImagePath('home1.jfif') }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken') || '';
        const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        // Menu
        try {
          const res = await fetch('/api/menu', { headers });
          if (res.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.data || fallbackMenuItems;
            setMenuItems(items.map(it => ({ ...it, price: parseInt(it.price) || 1200, image: it.image || getImagePath('Nyama-Choma-1-1080x1080.jpg.webp') })));
          } else setMenuItems(fallbackMenuItems);
        } catch (e) { setMenuItems(fallbackMenuItems); }

        // Halls
        try {
          const res = await fetch('/api/halls', { headers });
          if (res.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.data || fallbackHalls;
            setHalls(items.map(h => ({ ...h, image: h.image || getImagePath('hall 1.webp') })));
          } else setHalls(fallbackHalls);
        } catch (e) { setHalls(fallbackHalls); }

        // Rooms
        try {
          const res = await fetch('/api/rooms', { headers });
          if (res.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.data || fallbackRooms;
            setRooms(items.map(r => ({ ...r, price: parseInt(r.price) || 5000, image: r.image || getImagePath('home1.jfif') })));
          } else setRooms(fallbackRooms);
        } catch (e) { setRooms(fallbackRooms); }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const handleAddToCart = (item, quantity = 1) => {
    addToCart({ ...item, type: 'food', quantity: parseInt(quantity, 10) });
    setShowAddedMessage(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setShowAddedMessage(prev => ({ ...prev, [item.id]: false })), 1500);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    e.target.reset();
  };

  return (
    <main id="main-content" className="page-fade">
      {loading && <LoadingSpinner fullscreen label="Loading content..." />}

      {/* Hero Carousel */}
      <section id="home" className="hero">
        <div className="hero-carousel" aria-label="Hero carousel">
          {slides.map((slide, idx) => (
            <div key={idx} className={`slide ${idx === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url('${slide.image}')`, minHeight: '420px' }}>
              <div className="slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <a href={slide.ctaLink} className="btn">{slide.ctaText}</a>
              </div>
            </div>
          ))}

          <div className="carousel-controls">
            <button className="carousel-btn prev-btn" onClick={prevSlide} aria-label="Previous slide"><ChevronLeft size={20} /></button>
            <div className="slide-indicators">
              {slides.map((_, i) => (
                <button key={i} className={`indicator ${i === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(i)} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
            <button className="carousel-btn next-btn" onClick={nextSlide} aria-label="Next slide"><ChevronRight size={20} /></button>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="section menu container" aria-labelledby="menu-heading">
        <h2 id="menu-heading">Our Menu</h2>
        <div className="menu-grid" role="list">
          {loading && menuItems.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="menu-card skeleton-card">
                <div className="skeleton skeleton-image" style={{ height: 180 }} />
                <div className="skeleton" style={{ height: 18, marginTop: 12 }} />
                <div className="skeleton" style={{ height: 12, marginTop: 8 }} />
                <div className="skeleton" style={{ height: 12, marginTop: 6, width: '60%' }} />
              </div>
            ))
          ) : (
            menuItems.map(item => (
              <article key={item.id} className="menu-card" role="listitem" aria-label={item.name}>
                <div className="food-menu-card">
                  <img src={item.image} alt={item.name} />
                  <div className="food-menu-body">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="card-meta">
                      <div className="product-quantity-container">
                        <strong>KES { (item.price || 0).toLocaleString() }</strong>
                        <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                        <select id={`quantity-${item.id}`} defaultValue="1">
                          {[1,2,3,4,5].map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                        <div className={`added-to-cart ${showAddedMessage[item.id] ? 'show' : ''}`}>Added</div>
                        <button className="btn add-food" onClick={() => { const qty = document.getElementById(`quantity-${item.id}`).value; handleAddToCart(item, qty); }}>Make order</button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Events, Halls, Rooms */}
      <EventBooking />
      <HallBooking />
      <RoomBooking />

      {/* Contact */}
      <section id="contact" style={{ background: '#f5f5f5' }}>
        <div className="container">
          <h2 id="contact-heading">Get in Touch</h2>
          <div className="contact-grid">
            <div className="card">
              <form onSubmit={handleContactSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label>Name</label><input name="name" required /></div>
                  <div><label>Email</label><input name="email" type="email" required /></div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label>Message</label>
                  <textarea name="message" rows={4} />
                </div>
                <button className="btn" type="submit" style={{ marginTop: 12 }}>Send Message</button>
              </form>
            </div>

            <div className="card map">
              <h4>Our Location</h4>
              <p>Nakuru-Sigor Road, Nakuru — Near the mololine Annex booking office</p>
              <iframe width="100%" height="300" style={{ border: 0, borderRadius: 8 }} src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3989.7704115746333!2d36.074548973201836!3d-0.2807818353500334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2ske!4v1768858300792!5m2!1sen!2ske" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Megapark Resort Location"></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
