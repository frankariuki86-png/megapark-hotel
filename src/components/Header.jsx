import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from './AuthModal';
import '../styles/header.css';

const BASE_URL = import.meta.env.BASE_URL || '/megapark-hotel/';
const getImagePath = (imageName) => `${BASE_URL}images/${imageName}`;

const Header = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { getCartCount } = useCart();
  const { user, logout } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage, availableLanguages } = useLanguage();
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

  const handleSectionClick = (sectionId) => {
    handleNavLinkClick();
    // If not on home page, navigate to home with the section hash
    const currentPath = window.location.pathname;
    if (currentPath !== '/megapark-hotel/' && currentPath !== '/megapark-hotel') {
      window.location.href = `/#${sectionId}`;
    } else {
      // Already on home page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" onClick={handleNavLinkClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
            <img src={getImagePath('logo.png')} alt="Megapark Resort Logo" style={{ height: '40px', width: 'auto' }} />
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
              <li><Link to="/" onClick={handleNavLinkClick}>Home</Link></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); handleSectionClick('about'); }}>About Us</a></li>
              <li><a href="#menu" onClick={(e) => { e.preventDefault(); handleSectionClick('menu'); }}>Menu</a></li>
              <li><a href="#events" onClick={(e) => { e.preventDefault(); handleSectionClick('events'); }}>Events</a></li>
              <li><a href="#halls" onClick={(e) => { e.preventDefault(); handleSectionClick('halls'); }}>Halls</a></li>
              <li><a href="#rooms" onClick={(e) => { e.preventDefault(); handleSectionClick('rooms'); }}>Accommodation</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); handleSectionClick('contact'); }}>Contact</a></li>
              <li><Link to="/admin/login" className="admin-link" onClick={handleNavLinkClick}>🔐 Admin</Link></li>
              {user ? (
                <>
                  <li><Link to="/profile" className="nav-link" onClick={handleNavLinkClick}>👤 {user.firstName}</Link></li>
                  <li><button className="nav-btn logout-btn" onClick={() => { logout(); handleNavLinkClick(); }}>Logout</button></li>
                </>
              ) : null}
            </ul>
          </nav>

          <div className="header-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <div className="language-selector">
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                title="Select Language"
              >
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="user-info">
                <span className="user-name">👤 {user.firstName}</span>
                <button className="logout-btn-small" onClick={() => logout()} title="Logout">✕</button>
              </div>
            ) : (
              <button className="login-btn-header" onClick={() => setIsAuthModalOpen(true)}>Login</button>
            )}
            
            <Link to="/orders" className="action-icon orders-icon" title="View Orders" aria-label="Orders">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4V6zm0 4h16v8H4v-8zm2-4h2V2h8v4h2v2H6V6z"/>
              </svg>
              <span>Orders</span>
            </Link>

            <Link to="/checkout" className="action-icon cart-icon" title="Shopping Cart" aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
