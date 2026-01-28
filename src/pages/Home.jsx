import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState({});
  const { addToCart } = useCart();

  const slides = [
    {
      image: '/images/home1.jfif',
      title: 'Welcome to Megapark Resort.',
      description: 'Relax in comfort, enjoy authentic Kenyan cuisine, and create unforgettable memories.',
      ctaText: 'Explore the Resort',
      ctaLink: '#prices'
    },
    {
      image: '/images/home 2.jfif',
      title: 'Authentic Kenyan & Continental Cuisine.',
      description: 'Freshly prepared meals, local flavors, and a dining experience you\'ll love.',
      ctaText: 'View Our Menu',
      ctaLink: '#menu'
    },
    {
      image: '/images/home1.jfif',
      title: 'Rooms, Events & Celebrations.',
      description: 'Book comfortable rooms, weddings, conferences, and special events with ease.',
      ctaText: 'Book Now',
      ctaLink: '#rooms'
    },
    {
      image: '/images/mega-park4.jfif',
      title: 'Perfect Venue for Events',
      description: 'Weddings, conferences, and celebrations in a serene environment.',
      ctaText: 'Host an Event',
      ctaLink: '#events'
    },
    {
      image: '/images/megapark5.jfif',
      title: 'Relax & Unwind',
      description: 'Escape the noise and enjoy peaceful moments in nature.',
      ctaText: 'Discover More',
      ctaLink: '#about'
    },
    {
      image: '/images/megapark6.jfif',
      title: 'Family-Friendly Experience',
      description: 'Fun, comfort, and safety for the whole family.',
      ctaText: 'Plan Your Visit',
      ctaLink: '#contact'
    }
  ];

  const menuItems = [
    {
      id: 'nyama-choma',
      name: 'Nyama Choma',
      description: 'Grilled Kenyan beef served with ugali and kachumbari.',
      price: 1200,
      image: '/images/Nyama-Choma-1-1080x1080.jpg.webp'
    },
    {
      id: 'chapati-nyama',
      name: 'Chapati & Nyama',
      description: 'Classic chapati meal with meat and greens.',
      price: 1000,
      image: '/images/chapati nyama.png'
    },
    {
      id: 'matoke-beef',
      name: 'Matoke & beef',
      description: 'Spiced beef matoke and kachumbari.',
      price: 1200,
      image: '/images/matoke.png'
    },
    {
      id: 'fish-ugali',
      name: 'Ugali & fish',
      description: 'Grilled Kenyan fish served with ugali and greens.',
      price: 1300,
      image: '/images/fish.webp'
    }
  ];

  const halls = [
    {
      id: 'banquet',
      name: 'Banquet Hall',
      description: 'Spacious hall for weddings and large events, accommodating up to 200 guests.',
      image: '/images/hall 1.webp'
    },
    {
      id: 'conference',
      name: 'Conference Room',
      description: 'Modern conference room equipped with AV facilities for business meetings.',
      image: '/images/hall 2.webp'
    },
    {
      id: 'pavilion',
      name: 'Outdoor Pavilion',
      description: 'Beautiful outdoor space perfect for garden parties and casual gatherings.',
      image: '/images/hall 3.webp'
    }
  ];

  const rooms = [
    {
      id: 'standard',
      name: 'Standard Room',
      description: 'Comfortable room with essential amenities for a relaxing stay.',
      price: 5000,
      image: '/images/stardard rooms.webp'
    },
    {
      id: 'deluxe',
      name: 'Deluxe Room',
      description: 'Spacious room with premium amenities and a beautiful view.',
      price: 8000,
      image: '/images/Deluxe Room.webp'
    },
    {
      id: 'executive',
      name: 'Executive Suite',
      description: 'Luxurious suite with premium amenities and stunning views.',
      price: 12000,
      image: '/images/Executive Suite.webp'
    }
  ];

  // Carousel auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAddToCart = (item, quantity = 1) => {
    addToCart({
      ...item,
      quantity: parseInt(quantity)
    });

    setShowAddedMessage(prev => ({
      ...prev,
      [item.id]: true
    }));

    setTimeout(() => {
      setShowAddedMessage(prev => ({
        ...prev,
        [item.id]: false
      }));
    }, 2000);
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('Event booking request:', data);
    alert('Event booking request submitted! We will contact you soon.');
    e.target.reset();
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('Contact form data:', data);
    alert('Message sent successfully! We will get back to you soon.');
    e.target.reset();
  };

  return (
    <main>
      {/* Hero Carousel */}
      <section id="home" className="hero">
        <div className="hero-carousel" aria-live="polite">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url('${slide.image}')`, minHeight: '450px' }}
            >
              <div className="slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <a href={slide.ctaLink} className="btn">{slide.ctaText}</a>
              </div>
            </div>
          ))}

          <div className="carousel-controls">
            <button id="prevSlide" aria-label="Previous slide" onClick={prevSlide}>&lt;</button>
            <button id="nextSlide" aria-label="Next slide" onClick={nextSlide}>&gt;</button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about container">
        <h2>About Megapark Resort</h2>
        <div className="about-grid">
          <div>
            <p><strong>Megapark Resort</strong> is a serene getaway designed to offer comfort, relaxation, and memorable experiences. Nestled in a peaceful environment, we combine warm Kenyan hospitality with modern amenities to create a perfect destination for leisure and events. Our resort features comfortable accommodation, delicious authentic and continental cuisine, and well-designed spaces for weddings, conferences, and celebrations. Whether you are visiting to unwind, dine, or host a special occasion, Megapark Resort is committed to providing exceptional service and an unforgettable experience for every guest.</p>
          </div>
          <div className="about-photo">
            <img src="/images/about.webp" alt="about-photo" />
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="section menu container">
        <h2>Our Menu</h2>
        <div className="menu-grid">
          {menuItems.map((item) => (
            <article key={item.id} className="menu-card">
              <div className="food-menu-card">
                <img src={item.image} alt={item.name} />
                <div className="food-menu-body">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <br />
                  <div className="card-meta">
                    <div className="product-quantity-container">
                      <strong>KES {item.price.toLocaleString()}</strong>
                      <br /><br />
                      <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                      <select id={`quantity-${item.id}`} name="quantity" defaultValue="1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                      <div className="product-spacer"></div>
                      <div className={`added-to-cart ${showAddedMessage[item.id] ? 'show' : ''}`}>
                        Added
                      </div>
                      <button
                        className="btn add-food"
                        onClick={() => {
                          const quantity = document.getElementById(`quantity-${item.id}`).value;
                          handleAddToCart(item, quantity);
                        }}
                      >
                        Make order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="container section">
        <h3>Event Booking</h3>
        <div className="card">
          <p>Plan your event with our team. Fill the form to request a quote.</p>
          <form id="event-form" className="form-grid" onSubmit={handleEventSubmit}>
            <input name="name" placeholder="Your name" required />
            <input type="number" placeholder="phone number" required />
            <input name="email" placeholder="Email" required />
            <input name="date" type="date" required />
            <select name="type" required>
              <option>Wedding</option>
              <option>pre-wedding</option>
              <option>Conference</option>
              <option>Party</option>
            </select>
            <textarea name="notes" placeholder="Notes (guests, requirements)"></textarea>
            <button className="btn" type="submit">Request Quote</button>
          </form>
        </div>
      </section>

      {/* Halls Section */}
      <section id="halls" className="section halls container">
        <h2>Event Halls</h2>
        <div className="halls-grid">
          {halls.map((hall) => (
            <article key={hall.id} className="halls-card">
              <div>
                <img src={hall.image} alt={hall.name} />
                <div className="halls-body">
                  <h3>{hall.name}</h3>
                  <p>{hall.description}</p>
                  <br />
                  <div className="card-meta">
                    <div className="product-quantity-container">
                      <button className="btn add-food">Book now</button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="section rooms container">
        <h2>Accommodation</h2>
        <div className="rooms-grid">
          {rooms.map((room) => (
            <article key={room.id} className="rooms-card">
              <div>
                <img src={room.image} alt={room.name} />
                <div className="rooms-body">
                  <h3>{room.name}</h3>
                  <p>{room.description}</p>
                  <br />
                  <strong>KES {room.price.toLocaleString()}/night</strong>
                  <div className="card-meta">
                    <div className="product-quantity-container">
                      <br />
                      <button className="btn add-food">Book now</button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ background: '#f5f5f5' }}>
        <div className="container">
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#0b7546', marginBottom: '10px' }}>Get in Touch</h2>
          </div>
          <div className="contact-grid">
            <div className="card" style={{ padding: '16px' }}>
              <form id="contactForm" aria-label="Contact form" onSubmit={handleContactSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="name"><strong>Name</strong></label>
                    <input id="name" name="name" required placeholder="francis kariuki" />
                  </div>
                  <div>
                    <label htmlFor="email"><strong>Email</strong></label>
                    <input id="email" type="email" name="email" required placeholder="megapark@gmail.com" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div>
                    <label htmlFor="program"><strong>type of inquiry</strong></label>
                    <select id="program" name="program">
                      <option>wedding Event</option>
                      <option>Graduation event</option>
                      <option>conference</option>
                      <option>Other inquiries</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phone"><strong>Phone</strong> <small>(optional)</small></label>
                    <input id="phone" name="phone" placeholder="+254 7xx xxx xxx" />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label htmlFor="message"><strong>Message</strong></label>
                  <textarea id="message" name="message" rows="5" placeholder="Tell us how we can help"></textarea>
                </div>

                <button className="btn" type="submit" style={{ marginTop: '16px' }}>Send Message</button>
              </form>
            </div>
            <div className="card map">
              <h4>Our Location</h4>
              <p>Nakuru-Sigor Road, Nakuru — Near the mololine Annex booking office</p>
              <iframe 
                width="100%" 
                height="300" 
                style={{ border: '0', borderRadius: '8px' }}
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3989.7704115746333!2d36.074548973201836!3d-0.2807818353500334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2ske!4v1768858300792!5m2!1sen!2ske"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Megapark Resort Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
