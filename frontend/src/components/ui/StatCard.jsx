import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    onClick={onClick}
    className={`glass-card p-6 flex items-center gap-5 group hover:border-cyber-primary/40 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/[0.03]' : ''}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]`}>
      <Icon size={26} strokeWidth={1.8} />
    </div>
    <div className="min-w-0">
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5 group-hover:text-slate-400 transition-colors">{label}</p>
      <p className="text-3xl font-extrabold text-white tabular-nums tracking-tight">{value}</p>
    </div>
  </motion.div>
);

export default StatCard;
