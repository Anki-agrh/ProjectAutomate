import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const Skeleton = ({ className = '', ...props }) => {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
      className={`rounded-xl ${
        isDark ? 'bg-white/[0.05]' : 'bg-slate-200'
      } ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
