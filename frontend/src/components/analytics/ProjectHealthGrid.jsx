import React from 'react';
import { motion } from 'framer-motion';
import { Folder, CheckCircle } from 'lucide-react';
import { GlassCard } from '../ui';

const ProjectHealthGrid = ({ data = [] }) => {
  const getProgressColor = (pct) => {
    if (pct >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' };
    if (pct >= 40) return { bar: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/20' };
    return { bar: 'bg-indigo-500', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' };
  };

  return (
    <GlassCard className="p-8 min-h-[420px] flex flex-col" delay={0.2}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Folder size={18} className="text-indigo-400" />
            Project Health
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Completion status per project</p>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto custom-scrollbar max-h-[340px] pr-1">
          {data.map((proj, idx) => {
            const colors = getProgressColor(proj.completion_pct);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-sm font-bold text-white truncate flex-1 mr-3">{proj.name}</p>
                  <span className={`text-lg font-extrabold tabular-nums ${colors.text}`}>
                    {proj.completion_pct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${proj.completion_pct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.06 }}
                    className={`h-full rounded-full ${colors.bar} shadow-lg ${colors.glow}`}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle size={10} className="text-slate-500" />
                  <span className="text-[10px] text-slate-500">
                    {proj.completed_tasks}/{proj.total_tasks} tasks completed
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic">No projects found</div>
      )}
    </GlassCard>
  );
};

export default ProjectHealthGrid;
