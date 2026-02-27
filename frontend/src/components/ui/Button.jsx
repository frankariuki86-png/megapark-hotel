import React from 'react';
import '../../styles/global.css';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'btn';
  const variantClass = variant ? variant : '';
  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
