import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = false, active = false, onClick, delay = 0 }) => {
  const baseClasses = 'glass-card';
  const hoverClasses = hover ? 'glass-card-hover cursor-pointer' : '';
  const activeClasses = active ? 'glass-card-active' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`${baseClasses} ${hoverClasses} ${activeClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
