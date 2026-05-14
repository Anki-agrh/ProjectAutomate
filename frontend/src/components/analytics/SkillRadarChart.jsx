import React from 'react';
import { Target } from 'lucide-react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { GlassCard } from '../ui';

const SkillRadarChart = ({ data = [] }) => (
  <GlassCard className="p-8 min-h-[480px] flex flex-col" delay={0.1}>
    <div className="flex justify-between items-start mb-8">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Target size={18} className="text-cyber-primary" />
          Strategic Skill Alignment
        </h3>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Required vs. Available (Bench)</p>
      </div>
      <div className="bg-cyber-primary/10 text-cyber-primary px-2.5 py-1 rounded-lg text-[10px] font-bold">Delta Active</div>
    </div>
    <div className="flex-1 w-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis hide />
          <Radar name="Required" dataKey="required" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
          <Radar name="Bench Available" dataKey="available" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </GlassCard>
);

export default SkillRadarChart;
