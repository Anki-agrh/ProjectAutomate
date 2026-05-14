import React from 'react';
import { motion } from 'framer-motion';
import { Layers, TrendingDown } from 'lucide-react';
import { GlassCard } from '../ui';

const ResourceImbalanceChart = ({ data = [] }) => {
  // Group by normalized skill to prevent duplicates
  const groupedData = data.reduce((acc, curr) => {
    const rawSkill = (curr.skill || '').trim();
    const skillNorm = rawSkill.toLowerCase();
    
    if (!acc[skillNorm]) {
      acc[skillNorm] = {
        skill: rawSkill || 'Unknown', // Preserve first seen original casing
        required: 0,
        available: 0
      };
    }
    acc[skillNorm].required += curr.required || 0;
    acc[skillNorm].available += curr.available || 0;
    return acc;
  }, {});

  // Compute gaps and sort by biggest gap first
  const items = Object.values(groupedData)
    .map(d => ({ ...d, gap: d.required - d.available }))
    .sort((a, b) => b.gap - a.gap);

  const maxVal = Math.max(...items.map(d => Math.max(d.required, d.available)), 1);
  const criticalGaps = items.filter(g => g.gap > 0).slice(0, 3);

  return (
    <GlassCard className="p-8" delay={0.15}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Layers size={18} className="text-cyber-secondary" />
            Resource Imbalance
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Required vs Available — Skill Gap Overview</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-indigo-500 inline-block" /> Required</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-cyan-400 inline-block" /> Available</span>
        </div>
      </div>

      {/* Simple bar rows */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {items.map((item, idx) => (
          <motion.div
            key={item.skill}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-300 truncate max-w-[140px]">{item.skill}</span>
              <div className="flex items-center gap-3 text-[10px] tabular-nums">
                <span className="text-indigo-400 font-bold">{item.required} needed</span>
                <span className="text-cyan-400 font-bold">{item.available} avail</span>
                {item.gap > 0 && (
                  <span className="text-rose-400 font-black bg-rose-500/10 px-1.5 py-0.5 rounded">-{item.gap}</span>
                )}
                {item.gap <= 0 && (
                  <span className="text-emerald-400 font-black bg-emerald-500/10 px-1.5 py-0.5 rounded">+{Math.abs(item.gap)}</span>
                )}
              </div>
            </div>
            {/* Dual bar */}
            <div className="flex gap-1 h-3">
              <div className="flex-1 bg-white/[0.03] rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.required / maxVal) * 100}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.03 }}
                  className="h-full bg-indigo-500/60 rounded"
                />
              </div>
              <div className="flex-1 bg-white/[0.03] rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.available / maxVal) * 100}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.03 }}
                  className="h-full bg-cyan-400/60 rounded"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Critical gap alert */}
      {criticalGaps.length > 0 && (
        <div className="mt-6 p-4 bg-rose-500/[0.06] border border-rose-500/15 rounded-xl flex items-center gap-3">
          <TrendingDown className="text-rose-400 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-rose-400 text-xs">Critical Gaps</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Shortage in{' '}
              {criticalGaps.map((g, i) => (
                <span key={g.skill}>
                  <span className="text-white font-semibold">{g.skill}</span>
                  <span className="text-rose-400"> (-{g.gap})</span>
                  {i < criticalGaps.length - 1 && ', '}
                </span>
              ))}
              . Consider hiring or upskilling.
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default ResourceImbalanceChart;
