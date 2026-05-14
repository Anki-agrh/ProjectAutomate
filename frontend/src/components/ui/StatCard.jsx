import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="glass-card glass-card-hover p-6 flex items-center gap-5 group"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} transition-transform duration-300 group-hover:scale-110`}>
      <Icon size={26} strokeWidth={1.8} />
    </div>
    <div className="min-w-0">
      <p className="text-slate-400 text-sm font-medium tracking-wide">{label}</p>
      <p className="text-3xl font-extrabold text-white mt-0.5 tabular-nums">{value}</p>
    </div>
  </motion.div>
);

export default StatCard;
