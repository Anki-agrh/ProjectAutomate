import React from 'react';

const Logo = ({ className = 'w-12 h-12' }) => {
  return (
    <img 
      src="/logo.png" 
      alt="ScrumMaster Logo" 
      className={`${className} object-contain`}
    />
  );
};

export default Logo;
