import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
            <p><strong>WhatsApp:</strong> <a href="https://wa.me/254711768878" target="_blank" rel="noopener">+254 711 768 878</a></p>
            <p><strong>Email:</strong> <a href="mailto:megapark@gmail.com">megapark@gmail.com</a></p>
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
              <li><a href="https://www.facebook.com/share/1DD9trYBXc/" target="_blank" rel="noopener">Facebook</a></li>
              <li><a href="https://www.instagram.com/bluepeaktechsolution?utm_source=qr&igsh=YnJrMTNsNHV3aGo0" target="_blank" rel="noopener">Instagram</a></li>
              <li><a href="https://wa.me/254711768878" target="_blank" rel="noopener">WhatsApp</a></li>
              <li><a href="https://www.tiktok.com/@bluepeaktechsolution?_r=1&_t=ZM-91mFuZxYDnw" target="_blank" rel="noopener">Tiktok</a></li>
            </ul>
          </div>
        </div>

        <div className="copy">
          <span>© <span id="year"></span> Megapark Resort— All rights reserved.</span>
          <Link to="/">Back to top ↑</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          developed by: <a href="https://frankariuki86-png.github.io/bluepeak/" target="_blank" rel="noopener">Bluepeak Tech Solution</a>
        </div>
      </footer>

      <a className="whatsapp-float" href="https://wa.me/254711768878" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
          <path fill="#fff" d="M20.5 3.5A11 11 0 1 0 6.4 20.6L3 21.9l1.3-3.5A11 11 0 0 0 20.5 3.5z" />
          <path fill="#06D755" d="M12 2a10 10 0 1 0 7.07 17.07L21 22l-2.93-.93A10 10 0 0 0 12 2z" opacity="0.0"/>
          <path fill="#fff" d="M17.3 14.2c-.3-.15-1.9-.95-2.2-1.05-.3-.1-.5-.15-.7.15-.2.3-.8 1.05-.95 1.25-.15.2-.3.25-.55.08-.25-.15-1.05-.39-2-1.22-.74-.66-1.24-1.45-1.38-1.75-.14-.3 0-.46.12-.61.12-.12.25-.3.37-.45.12-.15.16-.25.25-.42.08-.15.04-.3-.02-.45-.06-.15-.7-1.7-.96-2.33-.25-.6-.5-.52-.7-.53-.18-.01-.4-.01-.6-.01l-.5.01c-.25 0-.65.08-.99.38-.34.29-1.3 1.27-1.3 3.1 0 1.82 1.33 3.57 1.52 3.82.2.25 2.62 4 6.35 5.6 3.73 1.6 3.73 1.07 4.4 1.01.6-.06 1.9-.77 2.17-1.52.28-.75.28-1.4.2-1.52-.08-.12-.28-.2-.59-.34z"/>
        </svg>
      </a>
    </>
  );
};

export default Footer;
