import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const kpiConfig = [
  { key: 'total_employees', label: 'Total Employees', icon: Users, color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20', textColor: 'text-indigo-400', iconColor: 'text-indigo-400' },
  { key: 'active_tasks', label: 'Active Tasks', icon: CheckCircle, color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20', textColor: 'text-cyan-400', iconColor: 'text-cyan-400' },
  { key: 'overdue_tasks', label: 'Overdue Tasks', icon: AlertTriangle, color: 'from-rose-500/20 to-rose-600/5 border-rose-500/20', textColor: 'text-rose-400', iconColor: 'text-rose-400' },
  { key: 'avg_reliability', label: 'Avg Reliability', icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20', textColor: 'text-emerald-400', iconColor: 'text-emerald-400', suffix: '%' },
];

const AnalyticsKPIRow = ({ kpis = {} }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {kpiConfig.map((kpi, idx) => (
      <motion.div
        key={kpi.key}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.06 }}
        className={`bg-gradient-to-br ${kpi.color} border rounded-2xl p-5 relative overflow-hidden`}
      >
        <div className="absolute top-3 right-3 opacity-[0.07]">
          <kpi.icon size={48} />
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{kpi.label}</p>
        <p className={`text-3xl font-extrabold tabular-nums ${kpi.textColor}`}>
          {kpis[kpi.key] ?? '—'}{kpi.suffix || ''}
        </p>
      </motion.div>
    ))}
  </div>
);

export default AnalyticsKPIRow;
