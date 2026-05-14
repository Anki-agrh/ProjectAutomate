import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Copy, Check } from 'lucide-react';
import { GlassCard, SkillTag, StatusBadge } from '../ui';
import GrowthTrendChart from './GrowthTrendChart';

const EmployeeProfile = ({ employee }) => {
  const [copied, setCopied] = useState(false);
  if (!employee) return null;

  const reliabilityColor = (employee.reliability_score || 100) >= 80 ? 'text-emerald-400' : 'text-rose-400';

  const handleCopyEmail = () => {
    if (employee.email) {
      navigator.clipboard.writeText(employee.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      key={employee.user_id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <GlassCard className="p-8 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyber-primary/[0.04] blur-[80px] -z-10 rounded-full" />

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyber-primary to-cyber-secondary p-[2px] shrink-0">
            <div className="w-full h-full rounded-2xl bg-cyber-dark flex items-center justify-center">
              <User size={48} className="text-white/15" strokeWidth={1} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white">{employee.name}</h3>
              <StatusBadge status="Available" />
            </div>
            <p className="text-slate-400 font-medium uppercase tracking-[0.15em] text-xs mb-1.5">
              {employee.role} • {employee.domain}
            </p>
            {employee.email && (
              <p className="text-slate-500 text-xs mb-6 flex items-center gap-1.5">
                <Mail size={12} className="text-slate-600" />
                {employee.email}
              </p>
            )}
            {!employee.email && <div className="mb-6" />}

            {/* Stat Chips */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/[0.04] rounded-xl px-5 py-3 border border-white/[0.05]">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Quality</p>
                <p className="text-xl font-extrabold text-white tabular-nums">{employee.avg_quality_score || 'N/A'}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl px-5 py-3 border border-white/[0.05]">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Experience</p>
                <p className="text-xl font-extrabold text-white tabular-nums">{employee.experience}Y</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl px-5 py-3 border border-white/[0.05]">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Reliability</p>
                <p className={`text-xl font-extrabold tabular-nums ${reliabilityColor}`}>
                  {employee.reliability_score || 100}%
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={handleCopyEmail}
              className={`px-5 py-2.5 text-sm inline-flex items-center gap-2 rounded-xl border transition-all duration-300 font-medium ${
                copied
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Email'}
            </button>
          </div>
        </div>

        {/* Skills & Growth */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/[0.05]">
          {/* Skills Cloud */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Briefcase size={14} /> Core Competencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {(employee.skills || []).map((skill, i) => (
                <SkillTag key={skill} skill={skill} variant={i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'accent' : 'secondary'} />
              ))}
            </div>
          </div>

          {/* Growth Trend */}
          <GrowthTrendChart userId={employee.user_id} />
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default EmployeeProfile;
