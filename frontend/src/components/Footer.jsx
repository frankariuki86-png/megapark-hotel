import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, ArrowUp, Facebook, Instagram, TrendingUp } from 'lucide-react';
import '../styles/footer.css';

const Footer = () => {
  useEffect(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }, []);

  return (
    <>
      <footer className="site-footer">
        <div className="footer-info">
          <div className="contact-details">
            <h3>Talk to us</h3>
            <p><strong><Phone size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />WhatsApp:</strong> <a href="https://wa.me/254711768878" target="_blank" rel="noopener" aria-label="WhatsApp: +254 711 768 878">+254 711 768 878</a></p>
            <p><strong><Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Email:</strong> <a href="mailto:megapark@gmail.com" aria-label="Email: megapark@gmail.com">megapark@gmail.com</a></p>
            <p><strong>Working Hours:</strong> Mon — Sun, 24 Hours</p>
          </div>

          <div>
            <h4>What We Promise</h4>
            <ul>
              <li>Warm Kenyan hospitality and friendly service</li>
              <li>Clean, comfortable rooms and facilities</li>
              <li>Delicious authentic and continental cuisine</li>
              <li>Peaceful, safe, and relaxing environment</li>
              <li>Memorable experiences for leisure, events, and celebrations</li>
            </ul>
          </div>

          <div className="social-media">
            <strong>Connect</strong>
            <ul>
              <li><a href="https://www.facebook.com/share/1DD9trYBXc/" target="_blank" rel="noopener" aria-label="Visit us on Facebook"><Facebook size={20} style={{ display: 'inline', marginRight: '8px' }} />Facebook</a></li>
              <li><a href="https://www.instagram.com/bluepeaktechsolution?utm_source=qr&igsh=YnJrMTNsNHV3aGo0" target="_blank" rel="noopener" aria-label="Visit us on Instagram"><Instagram size={20} style={{ display: 'inline', marginRight: '8px' }} />Instagram</a></li>
              <li><a href="https://wa.me/254711768878" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp"><MessageCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />WhatsApp</a></li>
              <li><a href="https://www.tiktok.com/@bluepeaktechsolution?_r=1&_t=ZM-91mFuZxYDnw" target="_blank" rel="noopener" aria-label="Follow us on TikTok"><TrendingUp size={20} style={{ display: 'inline', marginRight: '8px' }} />Tiktok</a></li>
            </ul>
          </div>
        </div>

        <div className="copy">
          <span>© <span id="year"></span> Megapark Resort— All rights reserved.</span>
          <Link to="/" aria-label="Back to top"><ArrowUp size={18} style={{ display: 'inline', marginLeft: '8px', verticalAlign: 'middle' }} /></Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          developed by: <a href="https://frankariuki86-png.github.io/bluepeak/" target="_blank" rel="noopener">Bluepeak Tech Solution</a>
        </div>
      </footer>

      <a className="whatsapp-float" href="https://wa.me/254711768878" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
        <MessageCircle size={32} color="#fff" fill="#25D366" />
      </a>
    </>
  );
};

export default Footer;
