import React from 'react';
import '../../styles/global.css';

const LoadingSpinner = ({ size = 'md', fullscreen = false, label = 'Loading...' }) => {
  const sizeClass = size === 'lg' ? 'spinner-lg' : size === 'sm' ? '' : '';
  
  if (fullscreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(2px)'
      }}>
        <div className={`spinner ${sizeClass}`}></div>
        {label && <p style={{ color: 'white', marginTop: '20px', fontSize: '1rem' }}>{label}</p>}
      </div>
    );
  }

  return (
    <div className="spinner-center">
      <div className={`spinner ${sizeClass}`}></div>
      {label && <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>{label}</span>}
    </div>
  );
};

export default LoadingSpinner;
