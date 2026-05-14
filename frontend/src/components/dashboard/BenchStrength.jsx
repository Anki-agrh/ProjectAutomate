import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { GlassCard, EmptyState, ProgressBar } from '../ui';

const BenchStrength = ({ skills = {} }) => {
  const entries = Object.entries(skills);
  const maxCount = Math.max(...entries.map(([, c]) => c), 1);

  return (
    <GlassCard className="p-8" delay={0.25}>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-cyber-secondary/15 flex items-center justify-center">
          <Users size={16} className="text-cyber-secondary" />
        </div>
        Bench Strength
      </h3>

      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map(([skill, count], idx) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.04 }}
            >
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-300 font-medium">{skill}</span>
                <span className="text-cyber-accent font-bold tabular-nums">{count}</span>
              </div>
              <ProgressBar value={count} max={maxCount} color="cyber-accent" />
            </motion.div>
          ))
        ) : (
          <EmptyState
            icon={Users}
            title="Full capacity"
            description="All hands on deck. No idle skills available."
          />
        )}
      </div>
    </GlassCard>
  );
};

export default BenchStrength;
