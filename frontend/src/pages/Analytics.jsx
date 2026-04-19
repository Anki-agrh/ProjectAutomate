import React, { useState, useEffect } from 'react';
import { getSkillGap } from '../api';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Target, Cpu, TrendingDown, Layers } from 'lucide-react';

const Analytics = () => {
  const [skillGap, setSkillGap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkillGap()
      .then(res => {
        setSkillGap(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Crunching system-wide analytics...</div>;

  return (
    <div className="p-10 animate-in fade-in zoom-in-95 duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">System <span className="text-cyber-accent">Analytics</span></h2>
        <p className="text-slate-400 mt-2">Deep-dive into resource utilization and organizational imbalances.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Radar Chart: Skill Gap Analysis */}
        <div className="glass rounded-3xl p-8 min-h-[500px] flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="text-cyber-primary" />
                Strategic Skill Alignment
              </h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Required vs. Available (Bench)</p>
            </div>
            <div className="bg-cyber-primary/10 text-cyber-primary px-3 py-1 rounded-full text-xs font-bold">
               Delta Active
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillGap}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis hide />
                <Radar
                  name="Required"
                  dataKey="required"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Bench Availability"
                  dataKey="available"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.4}
                />
                <Legend />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Resource Utilization Imbalance */}
        <div className="glass rounded-3xl p-8 min-h-[500px] flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Layers className="text-cyber-secondary" />
                Resource Imbalance
              </h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Quantifying the Skill Gap</p>
            </div>
            <Cpu className="text-slate-700" size={32} />
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGap} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="skill" 
                  type="category" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="required" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={20} />
                <Bar dataKey="available" fill="#22d3ee" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
             <TrendingDown className="text-rose-400 shrink-0" size={24} />
             <div>
                <h4 className="font-bold text-rose-400 text-sm">Critical Gap Warning</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                   Significant deficiency detected in <span className="text-white font-bold">Cloud Infra</span> & <span className="text-white font-bold">SQL</span>. Hire or train resources to avoid delivery delays.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
