import React from 'react';
import '../../styles/global.css';

const SkeletonLoader = ({ lines = 3, width = '100%', animated = true }) => {
  return (
    <div style={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`shimmer-line skeleton ${animated ? '' : ''}`}
          style={{
            width: i === lines - 1 ? '80%' : '100%',
            height: '12px',
            borderRadius: '4px',
            marginBottom: '10px'
          }}
        ></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
