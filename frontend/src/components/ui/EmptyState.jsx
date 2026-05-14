import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
  >
    <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
      <Icon size={36} className="text-slate-600" strokeWidth={1.2} />
    </div>
    <h4 className="text-lg font-bold text-slate-400 mb-1">{title}</h4>
    {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </motion.div>
);

export default EmptyState;
