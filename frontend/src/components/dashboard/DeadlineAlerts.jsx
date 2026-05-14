import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle } from 'lucide-react';
import { GlassCard, EmptyState } from '../ui';

const DeadlineAlerts = ({ alerts = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <GlassCard className="p-8" delay={0.2}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
            <Calendar size={16} className="text-rose-400" />
          </div>
          Deadline Alerts
        </h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {alerts.length} active
        </span>
      </div>

      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{alert.task}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Assigned to: {alert.assigned_to || 'Unassigned'}
                </p>
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  {formatDate(alert.deadline)}
                </p>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">Urgent</p>
              </div>
            </motion.div>
          ))
        ) : (
        <EmptyState
          icon={Calendar}
          title="All clear"
          description="No immediate deadlines detected."
        />
      )}
    </div>
  </GlassCard>
  );
};

export default DeadlineAlerts;
