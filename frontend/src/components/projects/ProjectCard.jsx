import React from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from '../ui';

const ProjectCard = ({ project, isSelected, onClick, index = 0 }) => (
  <motion.button
    initial={{ opacity: 0, x: -15 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ delay: index * 0.06, duration: 0.4 }}
    onClick={onClick}
    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${
      isSelected
        ? 'bg-cyber-primary/[0.08] border-cyber-primary/40 shadow-lg shadow-cyber-primary/5 neon-border'
        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1]'
    }`}
  >
    <h4 className="font-bold text-white mb-1.5 text-sm">{project.name}</h4>
    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{project.description}</p>
    <div className="mt-3 flex items-center justify-between">
      <StatusBadge status={project.status || 'Active'} />
      <span className="text-[10px] text-slate-600 font-mono">{project.tasks?.length || 0} tasks</span>
    </div>
  </motion.button>
);

export default ProjectCard;
