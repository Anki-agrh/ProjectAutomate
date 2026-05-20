import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Layers } from 'lucide-react';
import { EmptyState } from '../ui';

const SweepResults = ({ results, loading }) => {
  if (!results && !loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 opacity-30">
        <Layers size={56} className="mb-4 text-slate-600" />
        <p className="uppercase tracking-widest text-xs font-black text-slate-600">Waiting for Temporal Trigger</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32">
        <div className="w-16 h-16 border-[3px] border-white/[0.05] border-t-amber-400 rounded-full animate-spin mb-6" />
        <p className="text-amber-400 font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Scanning for Overdue Tasks</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold">Resolution <span className="gradient-text-primary">Log</span></h3>
        <span className="text-xs font-bold text-slate-500 tabular-nums">{results.tasks_processed} tasks processed</span>
      </header>

      <div className="space-y-3">
        {results.actions.length > 0 ? (
          results.actions.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-xl flex items-start gap-4"
            >
              <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${action.action === 'Extended' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                {action.action === 'Extended' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-white truncate">{action.task}</h4>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded shrink-0 ${action.action === 'Extended' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                    {action.action}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1.5">
                  {action.action === 'Extended'
                    ? `Grace period → ${action.employee}. New deadline: ${formatDate(action.new_deadline)}`
                    : `${action.old_employee} → ${action.new_employee}. Deadline: ${formatDate(action.new_deadline)}`}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState icon={Layers} title="All projects are on track" description="No overdue tasks detected today." />
        )}
      </div>
    </motion.div>
  );
};

export default SweepResults;
