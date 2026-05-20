import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import useApi from '../../hooks/useApi';
import { getGrowthTrend } from '../../api';

const GrowthTrendChart = ({ userId }) => {
  const { data, loading } = useApi(() => getGrowthTrend(userId), [userId], { enabled: !!userId });

  return (
    <div>
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <TrendingUp size={14} /> Performance Velocity
      </h4>
      {loading ? (
        <div className="h-44 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/10 border-t-cyber-primary rounded-full animate-spin" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-slate-500 italic bg-white/[0.02] rounded-xl border border-dashed border-white/[0.06]">
          Insufficient historical data
        </div>
      ) : (
        <div className="h-44 w-full text-slate-400">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-cyber-primary, #6366f1)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-cyber-primary, #6366f1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 9 }} width={30} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-cyber-dark, #0a0e1a)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' }} itemStyle={{ color: 'var(--color-cyber-accent, #22d3ee)' }} />
              <Area type="monotone" dataKey="score" stroke="var(--color-cyber-primary, #6366f1)" strokeWidth={2.5} fill="url(#growthGrad)" dot={{ fill: 'var(--color-cyber-primary, #6366f1)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: 'var(--color-cyber-accent, #22d3ee)', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GrowthTrendChart;
