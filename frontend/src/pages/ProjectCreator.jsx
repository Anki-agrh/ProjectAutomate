import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { generateProject } from '../api';
import { PageHeader, GlassCard, SkillTag } from '../components/ui';

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
      toast.success('Project architecture generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('AI failed to architect the project. Check your backend/API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto relative overflow-hidden">
      <div className="floating-orb w-[400px] h-[400px] bg-cyber-primary/10 -top-20 -right-20 blur-[100px]" />
      <div className="floating-orb w-[300px] h-[300px] bg-cyber-secondary/5 bottom-10 left-0 blur-[80px]" style={{ animationDelay: '-3s' }} />

      <PageHeader
        icon={Sparkles}
        title="AI Project"
        highlight="Architect"
        subtitle="Input your vision. ScrumMaster will handle the breakdown and assignment."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <GlassCard className="p-8" delay={0.05}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
              <input type="text" required className="input-base" placeholder="e.g. NextGen Mobile Wallet" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Description</label>
              <textarea required rows={5} className="input-base resize-none" placeholder="Describe what you want to build in detail..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Deadline</label>
              <input type="date" required className="input-base" value={formData.target_deadline} onChange={(e) => setFormData({ ...formData, target_deadline: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Architecting...' : 'Generate Technical Plan'}
            </button>
          </form>
        </GlassCard>

        {/* Results */}
        <GlassCard className="p-8 flex flex-col relative overflow-hidden min-h-[400px]" delay={0.1}>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 border-2 border-dashed border-white/[0.1] rounded-full flex items-center justify-center mb-4">
                  <ArrowRight className="text-slate-600" size={22} />
                </div>
                <p className="text-slate-500 font-medium text-sm">Your AI-generated roadmap will appear here.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-[3px] border-white/[0.06] border-t-cyber-primary animate-spin" />
                  <div className="absolute inset-2 rounded-full border-[3px] border-white/[0.04] border-b-cyber-accent animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                </div>
                <p className="text-cyber-accent font-bold animate-pulse uppercase tracking-[0.2em] text-sm">Decomposing Goals</p>
              </motion.div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full overflow-y-auto max-h-[520px] pr-2 custom-scrollbar">
                <div className="flex items-center gap-2.5 text-emerald-400 mb-6">
                  <CheckCircle2 size={20} />
                  <span className="font-bold text-sm uppercase tracking-wider">Plan Ready</span>
                </div>
                <div className="space-y-6">
                  {result.project_roadmap.map((phase, pIdx) => (
                    <motion.div key={pIdx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: pIdx * 0.08 }} className="border-l-2 border-cyber-primary/25 pl-5 relative">
                      <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-cyber-primary neon-glow-primary" />
                      <h4 className="text-base font-bold text-white mb-3">{phase.phase_name}</h4>
                      <ul className="space-y-2">
                        {phase.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                            <p className="text-sm font-semibold text-slate-200">{task.subtask}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-[10px] bg-cyber-primary/15 text-cyber-primary px-2 py-0.5 rounded-md font-bold">{task.assigned_to_name}</span>
                              <span className="text-[10px] text-slate-500">{task.estimated_days}d</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
};

export default ProjectCreator;
