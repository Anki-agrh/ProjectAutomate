import React from 'react';

const statusConfig = {
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  completed: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  planning: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  overdue: { bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
  assigned: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  unassigned: { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' },
  extended: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  reassigned: { bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
  review: { bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  done: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

const StatusBadge = ({ status, className = '' }) => {
  const key = (status || 'active').toLowerCase().replace(/\s+/g, '');
  const config = statusConfig[key] || statusConfig.active;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${config.bg} ${config.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {status}
    </span>
  );
};

export default StatusBadge;
