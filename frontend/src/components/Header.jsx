import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, User, LogOut, ShoppingCart, LogIn, Menu, X } from 'lucide-react';
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
  const [profileOpen, setProfileOpen] = useState(false);
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
              <li><Link to="/admin/login" className="admin-link" onClick={handleNavLinkClick} title="Admin Login">🔐 Admin</Link></li>
              {user ? (
                <>
                  <li><Link to="/profile" className="nav-link" onClick={handleNavLinkClick} title={`Profile - ${user.firstName}`}><User size={18} /> {user.firstName}</Link></li>
                  <li><button className="nav-btn logout-btn" onClick={() => { logout(); handleNavLinkClick(); }} title="Logout"><LogOut size={18} /> Logout</button></li>
                </>
              ) : null}
            </ul>
          </nav>

          <div className="header-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="language-selector">
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                title="Select Language"
                aria-label="Select language"
              >
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <Link to="/orders" className="action-icon orders-icon" title="View Orders" aria-label="View orders">
              <ShoppingCart size={20} />
              <span>Orders</span>
            </Link>

            <Link to="/checkout" className="action-icon cart-icon" title="Shopping Cart" aria-label="Shopping cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="user-info" tabIndex={0} onBlur={() => setProfileOpen(false)}>
                <button className="profile-button" onClick={() => setProfileOpen(v => !v)} aria-haspopup="true" aria-expanded={profileOpen}>
                  <User size={18} /> <span className="user-name-text">{user.firstName}</span>
                </button>
                {profileOpen && (
                  <div className="profile-dropdown" role="menu">
                    <Link to="/profile" className="profile-item" role="menuitem" onClick={() => setProfileOpen(false)}>Profile</Link>
                    <Link to="/orders" className="profile-item" role="menuitem" onClick={() => setProfileOpen(false)}>My Orders</Link>
                    <button className="profile-item" role="menuitem" onClick={() => { logout(); setProfileOpen(false); }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn-header" onClick={() => setIsAuthModalOpen(true)} aria-label="Login"><LogIn size={18} /> Login</button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
