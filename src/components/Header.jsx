import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/header.css';

const Header = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideNav = e.target.closest('#mainNav') || e.target.closest('#navToggle');
      if (!insideNav && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileNavOpen]);

  const handleNavLinkClick = () => {
    setMobileNavOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" onClick={handleNavLinkClick}>
          <img src="/images/logo.png" alt="Megapark Resort logo" />
          <h1 className="header-h1"><span>Megapark Resort</span></h1>
        </Link>

        <button 
          id="navToggle" 
          className="nav-toggle" 
          aria-label="Toggle navigation"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <span className="hamburger"></span>
        </button>

        <nav id="mainNav" className={`main-nav ${mobileNavOpen ? 'open' : ''}`}>
          <ul>
            <li><a href="/#home" onClick={handleNavLinkClick}>Home</a></li>
            <li><a href="/#about" onClick={handleNavLinkClick}>About Us</a></li>
            <li><a href="/#menu" onClick={handleNavLinkClick}>Menu</a></li>
            <li><a href="/#events" onClick={handleNavLinkClick}>Events</a></li>
            <li><a href="/#halls" onClick={handleNavLinkClick}>Halls</a></li>
            <li><a href="/#rooms" onClick={handleNavLinkClick}>Accommodation</a></li>
            <li><a href="/#contact" onClick={handleNavLinkClick}>Contact</a></li>
            <li><Link to="/orders" className="book-btn" onClick={handleNavLinkClick}>Orders</Link></li>
            <li>
              <Link to="/checkout" className="book-btn" onClick={handleNavLinkClick}>
                Cart (<span id="cart-count">{cartCount}</span>)
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
