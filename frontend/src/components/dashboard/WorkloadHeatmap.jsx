import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../ui';

const WorkloadHeatmap = ({ workforce }) => {
  if (!workforce || workforce.length === 0) return null;

  return (
    <GlassCard className="p-8 h-full flex flex-col border-rose-500/20 bg-rose-500/[0.02]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-rose-400">
          <Activity size={18} />
          Workload Saturation
        </h3>
        <span className="text-[10px] font-bold text-rose-500/80 bg-rose-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
          Bench Empty
        </span>
      </div>
      
      <p className="text-sm text-slate-400 mb-6">
        The bench is fully depleted. Active employees are exceeding standard task limits.
      </p>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {workforce.map((emp, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/[0.04] transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-cyber-primary transition-colors">{emp.name}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{emp.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`text-xl font-black ${emp.tasks >= 4 ? 'text-rose-500' : emp.tasks >= 3 ? 'text-amber-500' : 'text-cyber-primary'}`}>
                  {emp.tasks}
                </p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Tasks</p>
              </div>
              {emp.tasks >= 4 && (
                <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
};

export default WorkloadHeatmap;
