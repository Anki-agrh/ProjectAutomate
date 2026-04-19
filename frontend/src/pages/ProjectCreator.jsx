import React, { useState } from 'react';
import { generateProject } from '../api';
import { Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

const ProjectCreator = () => {
  const [formData, setFormData] = useState({ name: '', description: '', target_deadline: '2026-12-31' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await generateProject(formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("AI failed to architect the project. Check your backend/API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
      <header className="mb-10 text-center">
        <div className="w-16 h-16 bg-cyber-primary/20 text-cyber-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles size={32} />
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">AI Project <span className="text-cyber-accent">Architect</span></h2>
        <p className="text-slate-400 mt-2 text-lg">Input your vision. APEX will handle the breakdown and assignment.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Project Name</label>
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyber-primary text-white"
              placeholder="e.g. NextGen Mobile Wallet"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Technical Description</label>
            <textarea
              required
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyber-primary text-white"
              placeholder="Describe what you want to build in detail..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyber-primary to-cyber-secondary hover:opacity-90 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? "Architecting..." : "Generate Technical Plan"}
          </button>
        </form>

        <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {!result && !loading && (
            <div className="z-10">
              <div className="w-12 h-12 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="text-slate-500" />
              </div>
              <p className="text-slate-500 font-medium">Your AI-generated roadmap will appear here.</p>
            </div>
          )}

          {loading && (
            <div className="z-10 space-y-4">
              <div className="flex justify-center flex-col items-center">
                 <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-cyber-primary/20 border-t-cyber-primary animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-cyber-accent/20 border-b-cyber-accent animate-spin [animation-duration:1.5s]"></div>
                 </div>
                 <p className="text-cyber-accent font-bold animate-pulse uppercase tracking-[0.2em]">Decomposing Goals</p>
              </div>
            </div>
          )}

          {result && (
            <div className="w-full text-left overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              <div className="flex items-center gap-3 text-emerald-400 mb-6">
                <CheckCircle2 size={24} />
                <span className="font-bold text-xl uppercase tracking-wider">Plan Ready</span>
              </div>
              
              <div className="space-y-6">
                {result.project_roadmap.map((phase, pIdx) => (
                  <div key={pIdx} className="border-l-2 border-cyber-primary/30 pl-6 relative">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-cyber-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    <h4 className="text-lg font-bold text-white mb-3">{phase.phase_name}</h4>
                    <ul className="space-y-3">
                      {phase.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <p className="text-sm font-semibold">{task.subtask}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-[10px] bg-cyber-primary/20 text-cyber-primary px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
                                {task.assigned_to_name}
                             </span>
                             <span className="text-[10px] text-slate-500">{task.estimated_days} days</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreator;
