import React, { useState } from 'react';
import { manageOverdue } from '../api';
import { Zap, Clock, ShieldCheck, AlertTriangle, Play, RefreshCw, Layers } from 'lucide-react';

const TimeMachine = () => {
  const [simulatedDate, setSimulatedDate] = useState('2026-12-05');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSweep = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await manageOverdue({ simulated_today: simulatedDate, project_id: projectId || null });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Temporal anomaly detected. Could not process overdue tasks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 animate-in fade-in slide-in-from-top-10 duration-1000">
      <header className="mb-10 max-w-2xl">
        <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
          <Zap className="text-yellow-400 fill-yellow-400" />
          Time <span className="text-cyber-accent">Machine</span>
        </h2>
        <p className="text-slate-400 mt-2">
          Simulate the passage of time. APEX will trigger midnight sweeps, reassigning tasks from unreliable resources and extending deadlines for elite performers.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-8 rounded-3xl border-white/10">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <Clock size={18} className="text-cyber-primary" />
              Simulation Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Simulated "Today"</label>
                <input 
                  type="date"
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-cyber-primary text-white"
                  value={simulatedDate}
                  onChange={(e) => setSimulatedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Filter (Optional)</label>
                <input 
                  type="text"
                  placeholder="Enter project UUID..."
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-cyber-primary text-white text-xs"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </div>

              <button 
                onClick={handleSweep}
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 py-4 rounded-xl font-black text-black flex items-center justify-center gap-3 transition-all mt-6 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <Play size={20} />}
                {loading ? "Sweeping Timelines..." : "INITIATE MIDNIGHT SWEEP"}
              </button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl">
             <div className="flex gap-4">
                <ShieldCheck className="text-blue-400 shrink-0" />
                <div>
                   <h4 className="font-bold text-blue-400 text-sm">Automated Governance</h4>
                   <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Reliable employees (score 80+) receive automatic 2-day extensions. Unreliable ones lose the task to a better fit.
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Results Log */}
        <div className="lg:col-span-8 glass rounded-3xl p-8 relative overflow-hidden min-h-[500px]">
           {!results && !loading ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 py-32 opacity-30">
                <Layers size={64} className="mb-4" />
                <p className="uppercase tracking-widest text-xs font-black">Waiting for Temporal Trigger</p>
             </div>
           ) : loading ? (
             <div className="h-full flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 border-4 border-white/5 border-t-yellow-400 rounded-full animate-spin mb-6"></div>
                <p className="text-yellow-400 font-bold animate-pulse">RESTRUCTURING REALITY</p>
             </div>
           ) : (
             <div className="animate-in fade-in slide-in-from-right-10">
                <header className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-bold">Sweep <span className="text-cyber-accent">Log</span></h3>
                   <span className="text-xs font-bold text-slate-500">{results.tasks_processed} tasks processed</span>
                </header>

                <div className="space-y-4">
                   {results.actions.length > 0 ? (
                     results.actions.map((action, idx) => (
                       <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-start gap-5">
                          <div className={`mt-1 p-2 rounded-lg ${action.action === 'Extended' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                             {action.action === 'Extended' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between">
                                <h4 className="font-bold text-white">{action.task}</h4>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded transition-colors ${action.action === 'Extended' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                   {action.action}
                                </span>
                             </div>
                             <p className="text-sm text-slate-400 mt-2">
                                {action.action === 'Extended' 
                                  ? `Grace period granted to ${action.employee}. New deadline: ${action.new_deadline}`
                                  : `Reassigned from ${action.old_employee} to ${action.new_employee}. Priority deadline: ${action.new_deadline}`
                                }
                             </p>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-slate-500 italic">No overdue tasks detected for this temporal jump.</p>
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TimeMachine;
