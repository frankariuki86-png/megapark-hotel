import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/account.css';

const AuthModal = ({ isOpen, onClose }) => {
  const { register, login, googleLogin } = useUser();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(
    googleClientId && !String(googleClientId).includes('YOUR_GOOGLE_CLIENT_ID')
  );
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize Google Sign-In button when modal opens
  useEffect(() => {
    if (isOpen && window.google && isGoogleConfigured) {
      // Initialize after a short delay to ensure DOM is ready
      setTimeout(() => {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleSignIn
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: 320 }
        );
      }, 100);
    }
  }, [isOpen, isGoogleConfigured, googleClientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleGoogleSignIn = async (response) => {
    try {
      if (response.credential) {
        const res = await googleLogin(response.credential);
        if (!res.ok) {
          setErrors({ form: res.error });
        } else {
          setSuccessMessage('Login successful!');
          setTimeout(() => {
            setSuccessMessage('');
            onClose();
          }, 800);
        }
      }
    } catch (err) {
      setErrors({ form: 'Google sign-in failed. Please try again.' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!isLoginMode) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      try {
        if (isLoginMode) {
          const res = await login(formData.email, formData.password);
          if (res && res.ok === false) {
            setErrors({ form: res.error });
            return;
          }
        } else {
          const res = await register(formData.email, formData.password, formData.firstName, formData.lastName, formData.phone);
          if (res && res.ok === false) {
            setErrors({ form: res.error });
            return;
          }
        }
        setSuccessMessage(isLoginMode ? 'Login successful!' : 'Account created successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 800);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          phone: ''
        });
      } catch (err) {
        setErrors({ form: err.message || 'An error occurred' });
      }
    } else {
      setErrors(newErrors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>

        <div className="auth-modal-content">
          <h2>{isLoginMode ? 'Login' : 'Create Account'}</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            {successMessage && <div className="success-message" style={{marginBottom:12, background:'#e8f5e9', color:'#2e7d32', padding:'10px 12px', borderRadius:'6px'}}>{successMessage}</div>}
            {errors.form && <div className="error-message" style={{marginBottom:12}}>{errors.form}</div>}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {!isLoginMode && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254712345678"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </>
            )}

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {!isLoginMode && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              {isLoginMode ? 'Login' : 'Create Account'}
            </button>
          </form>

          {isGoogleConfigured && (
            <>
              <div className="auth-divider">Or continue with</div>
              <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}></div>
            </>
          )}

          <div className="auth-toggle">
            <p>
              {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setErrors({});
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: '',
                    phone: ''
                  });
                }}
                className="toggle-link"
              >
                {isLoginMode ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
