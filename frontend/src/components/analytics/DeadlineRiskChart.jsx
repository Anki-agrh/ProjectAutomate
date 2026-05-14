import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { GlassCard } from '../ui';

const statusConfig = {
  overdue: { icon: AlertTriangle, color: 'bg-rose-500/15 text-rose-400 border-rose-500/20', label: 'OVERDUE', dotColor: 'bg-rose-400' },
  due_soon: { icon: AlertCircle, color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', label: 'DUE SOON', dotColor: 'bg-amber-400' },
  on_track: { icon: CheckCircle, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: 'ON TRACK', dotColor: 'bg-emerald-400' },
};

const DeadlineRiskChart = ({ data = [], summary = {} }) => {
  // Sort: overdue first, then due_soon, then on_track
  const priorityOrder = { overdue: 0, due_soon: 1, on_track: 2 };
  const sorted = [...data].sort((a, b) => (priorityOrder[a.status] ?? 3) - (priorityOrder[b.status] ?? 3));
  const display = sorted.slice(0, 12); // Show top 12

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <GlassCard className="p-8 min-h-[420px] flex flex-col" delay={0.25}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock size={18} className="text-amber-400" />
            Deadline Risk Map
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Task deadline health overview</p>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 mb-5">
        <div className="flex items-center gap-2 bg-rose-500/[0.08] border border-rose-500/15 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-[10px] font-bold text-rose-400">{summary.overdue || 0} Overdue</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/[0.08] border border-amber-500/15 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">{summary.due_soon || 0} Due Soon</span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/15 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400">{summary.on_track || 0} On Track</span>
        </div>
      </div>

      {/* Task list */}
      {display.length > 0 ? (
        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar max-h-[300px] pr-1">
          {display.map((item, idx) => {
            const conf = statusConfig[item.status] || statusConfig.on_track;
            const Icon = conf.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${conf.color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.task}</p>
                  <p className="text-[10px] text-slate-500">{item.employee}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-300 tabular-nums">{formatDate(item.deadline)}</p>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${conf.color} px-1.5 py-0.5 rounded`}>
                    {conf.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic">No active deadlines</div>
      )}
    </GlassCard>
  );
};

export default DeadlineRiskChart;
