import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import {
  Sparkles, BarChart3, Users, Zap, Folder, PlusSquare,
  ArrowRight, Shield, Brain, CheckCircle, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: PlusSquare,
    title: 'AI Project Architect',
    desc: 'Describe your vision and let ScrumMaster\'s AI break it down into phases, tasks, and auto-assign the perfect team members.',
    color: 'from-indigo-500 to-purple-500',
    iconBg: 'bg-indigo-500/15 text-indigo-400',
  },
  {
    icon: Folder,
    title: 'Active Projects',
    desc: 'Visual Gantt timelines with real dates, task backlogs, and one-click completion tracking across all your projects.',
    color: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
  },
  {
    icon: Users,
    title: 'Employee Directory',
    desc: 'Full workforce visibility — reliability scores, skill inventories, performance velocity charts, and search across 400+ employees.',
    color: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Time Machine',
    desc: 'Simulate future dates to trigger automated governance — extending deadlines for reliable employees, reassigning from unreliable ones.',
    color: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/15 text-amber-400',
  },
  {
    icon: BarChart3,
    title: 'System Analytics',
    desc: 'KPI dashboards, workload heatmaps, project health matrices, deadline risk maps, and skill gap analysis at a glance.',
    color: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-500/15 text-rose-400',
  },
  {
    icon: Shield,
    title: 'Reliability',
    desc: 'Automated scoring system — employees earn points for completing tasks on time and lose them for missed deadlines.',
    color: 'from-violet-500 to-indigo-500',
    iconBg: 'bg-violet-500/15 text-violet-400',
  },
];

const stats = [
  { value: '400+', label: 'Employees Managed' },
  { value: 'AI', label: 'Powered Assignments' },
  { value: '100%', label: 'Automated Governance' },
  { value: 'Real-time', label: 'Analytics' },
];

const HomePage = ({ onNavigateToLogin }) => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-cyber-dark text-white' : 'bg-white text-slate-900'
    }`}>
      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDark
          ? 'bg-cyber-dark/80 backdrop-blur-2xl border-b border-white/[0.06]'
          : 'bg-white/80 backdrop-blur-2xl border-b border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-cyber-primary/20">
              S
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight uppercase leading-none">ScrumMaster</h1>
              <p className="text-[9px] text-cyber-accent font-bold uppercase tracking-[0.2em] leading-none mt-0.5">
                Project Automation
              </p>
            </div>
          </div>

          {/* Right: Theme toggle + Login */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onNavigateToLogin}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                isDark
                  ? 'bg-white/[0.06] border border-white/[0.1] text-white hover:bg-white/[0.1]'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={onNavigateToLogin}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              Sign Up <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-cyber-primary/[0.08] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-cyber-secondary/[0.06] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-cyber-accent/[0.04] blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold ${
              isDark
                ? 'bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/20'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}
          >
            <Brain size={14} />
            AI-Powered Project Management
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6"
          >
            Automate Your
            <br />
            <span className="gradient-text">Project Workflow</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            ScrumMaster uses AI to decompose projects, match employees by skills, enforce
            deadlines, and deliver real-time analytics —
            all the things you need.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <button
              onClick={onNavigateToLogin}
              className="btn-primary px-8 py-4 text-base shadow-xl shadow-cyber-primary/20"
            >
              <Sparkles size={20} />
              Get Started
              <ChevronRight size={18} />
            </button>
            <a
              href="#features"
              className={`px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center gap-2 ${
                isDark
                  ? 'bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.08]'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Explore Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className={`py-10 border-y ${
        isDark ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-extrabold gradient-text-primary">{stat.value}</p>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Command & Control</span>
            </h2>
            <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              From AI task assignment to real-time analytics, ScrumMaster handles every aspect of project management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`group p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feat.iconBg}`}>
                  <feat.icon size={22} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className={`py-24 px-6 ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              How <span className="gradient-text">ScrumMaster</span> Works
            </h2>
          </motion.div>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Describe Your Project', desc: 'Enter your project name and description. Set a target deadline.' },
              { step: '02', title: 'AI Breaks It Down', desc: 'Gemini AI decomposes your project into phases and subtasks with estimated timelines.' },
              { step: '03', title: 'Smart Assignment', desc: 'ML model matches each task to the best-fit employee based on skills, experience, and workload.' },
              { step: '04', title: 'Automated Governance', desc: 'Time Machine enforces deadlines — reliable employees get extensions, others get reassigned.' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-6 p-6 rounded-2xl transition-all ${
                  isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-lg shadow-cyber-primary/20">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA FOOTER ========== */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-primary/[0.06] via-cyber-secondary/[0.04] to-cyber-accent/[0.06] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold mb-4"
          >
            Ready to <span className="gradient-text">Automate</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`text-base mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Join ScrumMaster Command Center and let AI handle the complexity.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={onNavigateToLogin}
            className="btn-primary px-10 py-4 text-lg shadow-xl shadow-cyber-primary/20 mx-auto"
          >
            <Sparkles size={22} />
            Launch Command Center
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className={`py-8 px-6 border-t text-center ${
        isDark ? 'border-white/[0.04] text-slate-600' : 'border-slate-100 text-slate-400'
      }`}>
        <p className="text-xs font-medium">© 2026 ScrumMaster Command Center — AI-Powered Project Automation</p>
      </footer>
    </div>
  );
};

export default HomePage;
