import React from 'react';
import '../../styles/global.css';

const Card = ({ children, className = '', ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
