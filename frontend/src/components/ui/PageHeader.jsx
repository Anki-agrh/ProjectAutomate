import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, highlight, subtitle, icon: Icon, children }) => (
  <motion.header
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
  >
    <div>
      <div className="flex items-center gap-3 mb-1">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-cyber-primary/15 flex items-center justify-center text-cyber-primary">
            <Icon size={22} />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {title}{' '}
          {highlight && <span className="gradient-text-primary">{highlight}</span>}
        </h1>
      </div>
      {subtitle && (
        <p className="text-slate-400 mt-2 text-sm md:text-base ml-0 md:ml-[52px]">{subtitle}</p>
      )}
    </div>
    {children && <div className="flex items-center gap-3">{children}</div>}
  </motion.header>
);

export default PageHeader;
