import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import RoomBooking from '../components/RoomBooking';
import HallBooking from '../components/HallBooking';
import EventBooking from '../components/EventBooking';
import '../styles/home.css';

const BASE_URL = import.meta.env.BASE_URL || '/megapark-hotel/';
const getImagePath = (imageName) => `${BASE_URL}images/${imageName}`;

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [halls, setHalls] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Placeholder slides (these don't change)
  const slides = [
    {
      image: getImagePath('home1.jfif'),
      title: 'Welcome to Megapark Resort.',
      description: 'Relax in comfort, enjoy authentic Kenyan cuisine, and create unforgettable memories.',
      ctaText: 'Explore the Resort',
      ctaLink: '#about'
    },
    {
      image: getImagePath('home 2.jfif'),
      title: 'Authentic Kenyan & Continental Cuisine.',
      description: 'Freshly prepared meals, local flavors, and a dining experience you\'ll love.',
      ctaText: 'View Our Menu',
      ctaLink: '#menu'
    },
    {
      image: getImagePath('home1.jfif'),
      title: 'Rooms, Events & Celebrations.',
      description: 'Book comfortable rooms, weddings, conferences, and special events with ease.',
      ctaText: 'Book Now',
      ctaLink: '#rooms'
    },
    {
      image: getImagePath('mega-park4.jfif'),
      title: 'Perfect Venue for Events',
      description: 'Weddings, conferences, and celebrations in a serene environment.',
      ctaText: 'Host an Event',
      ctaLink: '#events'
    },
    {
      image: getImagePath('megapark5.jfif'),
      title: 'Relax & Unwind',
      description: 'Escape the noise and enjoy peaceful moments in nature.',
      ctaText: 'Discover More',
      ctaLink: '#about'
    },
    {
      image: getImagePath('megapark6.jfif'),
      title: 'Family-Friendly Experience',
      description: 'Fun, comfort, and safety for the whole family.',
      ctaText: 'Plan Your Visit',
      ctaLink: '#contact'
    }
  ];

  // Fallback data for when API is unavailable
  const fallbackMenuItems = [
    {
      id: 'nyama-choma',
      name: 'Nyama Choma',
      description: 'Grilled Kenyan beef served with ugali and kachumbari.',
      price: 1200,
      image: getImagePath('Nyama-Choma-1-1080x1080.jpg.webp')
    },
    {
      id: 'chapati-nyama',
      name: 'Chapati & Nyama',
      description: 'Classic chapati meal with meat and greens.',
      price: 1000,
      image: getImagePath('chapati nyama.png')
    },
    {
      id: 'matoke-beef',
      name: 'Matoke & beef',
      description: 'Spiced beef matoke and kachumbari.',
      price: 1200,
      image: getImagePath('matoke.png')
    },
    {
      id: 'fish-ugali',
      name: 'Ugali & fish',
      description: 'Grilled Kenyan fish served with ugali and greens.',
      price: 1300,
      image: getImagePath('fish.webp')
    }
  ];

  const fallbackHalls = [
    {
      id: 'banquet',
      name: 'Banquet Hall',
      description: 'Spacious hall for weddings and large events, accommodating up to 200 guests.',
      image: getImagePath('hall 1.webp')
    },
    {
      id: 'conference',
      name: 'Conference Room',
      description: 'Modern conference room equipped with AV facilities for business meetings.',
      image: getImagePath('hall 2.webp')
    },
    {
      id: 'pavilion',
      name: 'Outdoor Pavilion',
      description: 'Beautiful outdoor space perfect for garden parties and casual gatherings.',
      image: getImagePath('hall 3.webp')
    }
  ];

  const fallbackRooms = [
    {
      id: 'standard',
      name: 'Standard Room',
      description: 'Comfortable room with essential amenities for a relaxing stay.',
      price: 5000,
      image: getImagePath('stardard rooms.webp')
    },
    {
      id: 'deluxe',
      name: 'Deluxe Room',
      description: 'Spacious room with premium amenities and a beautiful view.',
      price: 8000,
      image: getImagePath('Deluxe Room.webp')
    },
    {
      id: 'executive',
      name: 'Executive Suite',
      description: 'Luxurious suite with premium amenities and stunning views.',
      price: 12000,
      image: getImagePath('Executive Suite.webp')
    }
  ];

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch from API with auth header
        const token = localStorage.getItem('adminToken') || '';
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Fetch menu items
        const menuRes = await fetch('/api/menu', { headers });
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenuItems(Array.isArray(menuData) ? menuData : menuData.data || fallbackMenuItems);
        } else {
          setMenuItems(fallbackMenuItems);
        }

        // Fetch halls (without auth for public view)
        const hallsRes = await fetch('/api/halls', { headers });
        if (hallsRes.ok) {
          const hallsData = await hallsRes.json();
          setHalls(Array.isArray(hallsData) ? hallsData : hallsData.data || fallbackHalls);
        } else {
          setHalls(fallbackHalls);
        }

        // Fetch rooms (without auth for public view)
        const roomsRes = await fetch('/api/rooms', { headers });
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(Array.isArray(roomsData) ? roomsData : roomsData.data || fallbackRooms);
        } else {
          setRooms(fallbackRooms);
        }
      } catch (error) {
        console.warn('Failed to fetch data from API, using fallback data:', error);
        setMenuItems(fallbackMenuItems);
        setHalls(fallbackHalls);
        setRooms(fallbackRooms);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      type: 'food',
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('Contact form data:', data);
    alert('Message sent successfully! We will get back to you soon.');
    e.target.reset();
  };

  return (
    <main id="main-content">
      {/* Hero Carousel */}
      <section id="home" className="hero">
        <div className="hero-carousel" aria-label="Hero carousel" role="region" aria-live="polite" aria-atomic="true">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url('${slide.image}')`, minHeight: '450px' }}
              aria-hidden={index !== currentSlide}
              role="tabpanel"
              aria-label={`Slide ${index + 1}: ${slide.title}`}
            >
              <div className="slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <a href={slide.ctaLink} className="btn" title={slide.ctaText}>{slide.ctaText}</a>
              </div>
            </div>
          ))}

          <div className="carousel-controls" role="group" aria-label="Carousel controls">
            <button 
              id="prevSlide" 
              className="carousel-btn prev-btn"
              aria-label={`Previous slide (Currently on slide ${currentSlide + 1} of ${slides.length})`}
              title="Previous slide (Press left arrow)"
              onClick={prevSlide}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="slide-indicators" role="tablist" aria-label="Slide indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                  role="tab"
                  aria-selected={index === currentSlide}
                  title={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button 
              id="nextSlide" 
              className="carousel-btn next-btn"
              aria-label={`Next slide (Currently on slide ${currentSlide + 1} of ${slides.length})`}
              title="Next slide (Press right arrow)"
              onClick={nextSlide}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about container" aria-labelledby="about-heading">
        <h2 id="about-heading">About Megapark Resort</h2>
        <div className="about-grid">
          <div>
            <p><strong>Megapark Resort</strong> is a serene getaway designed to offer comfort, relaxation, and memorable experiences. Nestled in a peaceful environment, we combine warm Kenyan hospitality with modern amenities to create a perfect destination for leisure and events. Our resort features comfortable accommodation, delicious authentic and continental cuisine, and well-designed spaces for weddings, conferences, and celebrations. Whether you are visiting to unwind, dine, or host a special occasion, Megapark Resort is committed to providing exceptional service and an unforgettable experience for every guest.</p>
          </div>
          <div className="about-photo">
            <img src={getImagePath('about.webp')} alt="Megapark Resort exterior and landscape" />
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="section menu container" aria-labelledby="menu-heading">
        <h2 id="menu-heading">Our Menu</h2>
        <div className="menu-grid" role="list">
          {menuItems.map((item) => (
            <article key={item.id} className="menu-card" role="listitem" aria-label={item.name}>
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
                      <select id={`quantity-${item.id}`} name="quantity" defaultValue="1" aria-label={`Quantity for ${item.name}`}>
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
                        aria-label={`Add ${item.name} to cart`}
                        title={`Add ${item.name} to cart`}
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
      <EventBooking />

      {/* Halls Section */}
      <HallBooking />

      {/* Rooms Section */}
      <RoomBooking />

      {/* Contact Section */}
      <section id="contact" style={{ background: '#f5f5f5' }}>
        <div className="container">
          <div style={{ marginBottom: '30px' }}>
            <h2 id="contact-heading" style={{ color: '#0b7546', marginBottom: '10px' }}>Get in Touch</h2>
          </div>
          <div className="contact-grid">
            <div className="card" style={{ padding: '16px' }}>
              <form id="contactForm" aria-labelledby="contact-heading" onSubmit={handleContactSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="name"><strong>Name</strong></label>
                    <input id="name" name="name" required placeholder="francis kariuki" aria-required="true" />
                  </div>
                  <div>
                    <label htmlFor="email"><strong>Email</strong></label>
                    <input id="email" type="email" name="email" required placeholder="megapark@gmail.com" aria-required="true" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div>
                    <label htmlFor="program"><strong>type of inquiry</strong></label>
                    <select id="program" name="program" aria-label="Type of inquiry">
                      <option>wedding Event</option>
                      <option>Graduation event</option>
                      <option>conference</option>
                      <option>Other inquiries</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phone"><strong>Phone</strong> <small>(optional)</small></label>
                    <input id="phone" name="phone" placeholder="+254 7xx xxx xxx" aria-label="Phone number" />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label htmlFor="message"><strong>Message</strong></label>
                  <textarea id="message" name="message" rows="5" placeholder="Tell us how we can help" aria-label="Message"></textarea>
                </div>

                <button className="btn" type="submit" style={{ marginTop: '16px' }} aria-label="Send contact message">Send Message</button>
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
                title="Megapark Resort Location on Google Maps"
                aria-label="Google Maps showing Megapark Resort location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
