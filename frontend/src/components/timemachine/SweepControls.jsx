import React from 'react';
import { Clock, Play, RefreshCw, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui';

const SweepControls = ({ simulatedDate, projectId, projects, onDateChange, onProjectIdChange, onSweep, loading }) => (
  <div className="space-y-6">
    <GlassCard className="p-8" delay={0.1}>
      <h3 className="text-base font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
        <Clock size={16} className="text-cyber-primary" />
        Simulation Settings
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Simulated "Today"</label>
          <input type="date" className="input-base" value={simulatedDate} onChange={(e) => onDateChange(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Project Filter (Optional)</label>
          <select className="input-base" value={projectId} onChange={(e) => onProjectIdChange(e.target.value)}>
            <option value="">All Projects</option>
            {(projects || []).map(p => (
              <option key={p.project_id} value={p.project_id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button onClick={onSweep} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 py-4 rounded-xl font-black text-black flex items-center justify-center gap-3 transition-all mt-4 shadow-[0_0_20px_rgba(234,179,8,0.2)] disabled:opacity-50">
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
          {loading ? 'Sweeping Timelines...' : 'INITIATE MIDNIGHT SWEEP'}
        </button>
      </div>
    </GlassCard>

    <div className="bg-blue-500/[0.06] border border-blue-500/15 p-5 rounded-2xl">
      <div className="flex gap-3">
        <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="font-bold text-blue-400 text-sm">Automated Governance</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Reliable employees (80+) get 2-day extensions. Unreliable ones lose the task to a better fit.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default SweepControls;
