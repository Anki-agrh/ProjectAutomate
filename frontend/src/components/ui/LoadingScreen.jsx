import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-32"
  >
    <div className="relative w-20 h-20 mb-8">
      <div className="absolute inset-0 rounded-full border-[3px] border-white/[0.06] border-t-cyber-primary animate-spin" />
      <div className="absolute inset-2 rounded-full border-[3px] border-white/[0.04] border-b-cyber-accent animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      <div className="absolute inset-4 rounded-full border-[3px] border-white/[0.03] border-t-cyber-secondary animate-spin" style={{ animationDuration: '2s' }} />
    </div>
    <p className="text-cyber-accent font-semibold text-sm animate-pulse uppercase tracking-[0.25em]">
      {message}
    </p>
  </motion.div>
);

export default LoadingScreen;
