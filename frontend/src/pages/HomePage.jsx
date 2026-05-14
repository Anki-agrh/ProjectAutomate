import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import {
  Sparkles, BarChart3, Users, Zap, Folder, PlusSquare,
  ArrowRight, Shield, Brain, ChevronRight,
  Clock, Target, Cpu, GitBranch, Activity
} from 'lucide-react';

/* ─── Unsplash corporate tech images ─── */
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
  about: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
  cta: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
  cardPlanning: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80',
  cardAnalytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  cardTeamwork: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
};

/* ─── Feature cards (image-based, like destination cards) ─── */
const showcaseCards = [
  {
    image: IMAGES.cardPlanning,
    title: 'AI Planning',
    subtitle: 'Smart Decomposition',
    color: 'from-indigo-600 to-purple-600',
  },
  {
    image: IMAGES.cardAnalytics,
    title: 'Team Analytics',
    subtitle: 'Performance Insights',
    color: 'from-cyan-600 to-blue-600',
  },
  {
    image: IMAGES.cardTeamwork,
    title: 'Collaboration',
    subtitle: 'Seamless Teamwork',
    color: 'from-amber-600 to-orange-600',
  },
];

/* ─── Features list ─── */
const features = [
  {
    icon: PlusSquare,
    title: 'AI Project Architect',
    desc: 'Describe your vision and let ScrumMaster\'s AI break it down into phases, tasks, and auto-assign the perfect team members.',
    iconBg: 'bg-indigo-500/15 text-indigo-400',
  },
  {
    icon: Folder,
    title: 'Active Projects',
    desc: 'Visual Gantt timelines with real dates, task backlogs, and one-click completion tracking across all your projects.',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
  },
  {
    icon: Users,
    title: 'Employee Directory',
    desc: 'Full workforce visibility — reliability scores, skill inventories, performance velocity charts, and search across 400+ employees.',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Time Machine',
    desc: 'Simulate future dates to trigger automated governance — extending deadlines for reliable employees, reassigning from unreliable ones.',
    iconBg: 'bg-amber-500/15 text-amber-400',
  },
  {
    icon: BarChart3,
    title: 'System Analytics',
    desc: 'KPI dashboards, workload heatmaps, project health matrices, deadline risk maps, and skill gap analysis at a glance.',
    iconBg: 'bg-rose-500/15 text-rose-400',
  },
  {
    icon: Shield,
    title: 'Reliability',
    desc: 'Automated scoring system — employees earn points for completing tasks on time and lose them for missed deadlines.',
    iconBg: 'bg-violet-500/15 text-violet-400',
  },
];

const stats = [
  { value: '400+', label: 'Employees Managed', icon: Users },
  { value: 'AI', label: 'Powered Assignments', icon: Brain },
  { value: '100%', label: 'Automated Governance', icon: Cpu },
  { value: 'Real-time', label: 'Analytics', icon: Activity },
];

const HomePage = ({ onNavigateToLogin }) => {
  const { isDark } = useTheme();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-cyber-dark text-white' : 'bg-white text-slate-900'
    }`}>
      {/* ════════════ NAVBAR ════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDark
          ? 'bg-cyber-dark/60 backdrop-blur-2xl border-b border-white/[0.06]'
          : 'bg-white/70 backdrop-blur-2xl border-b border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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

          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Features', 'How It Works'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className={`text-sm font-semibold transition-colors hover:text-cyber-primary ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {link}
              </a>
            ))}
          </div>

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

      {/* ════════════ HERO — Full-bleed corporate office bg ════════════ */}
      <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
        >
          <img src={IMAGES.hero} alt="" className="w-full h-full object-cover" />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-cyber-dark/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-primary/10 via-transparent to-cyber-secondary/10" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cyber-dark via-cyber-dark/80 to-transparent" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold bg-white/[0.1] backdrop-blur-md text-white border border-white/[0.15]"
          >
            <Brain size={14} className="text-cyber-accent" />
            AI-Powered Project Management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[0.9] mb-4 text-white"
            style={{
              textShadow: '0 4px 30px rgba(99,102,241,0.3), 0 2px 10px rgba(0,0,0,0.5)',
              fontStyle: 'italic',
            }}
          >
            ScrumMaster
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-cyber-accent/90 mb-6"
          >
            We Automate Your Project Workflow
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-slate-300/90"
          >
            AI decomposes projects, matches employees by skills, enforces deadlines, and delivers real-time analytics — all from one command center.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <button
              onClick={onNavigateToLogin}
              className="btn-primary px-8 py-4 text-base shadow-2xl shadow-cyber-primary/30"
            >
              <Sparkles size={20} />
              Get Started
              <ChevronRight size={18} />
            </button>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center gap-2 bg-white/[0.1] backdrop-blur-sm border border-white/[0.15] text-white hover:bg-white/[0.18]"
            >
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ ABOUT — Team collaboration bg ════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.about} alt="" className="w-full h-full object-cover opacity-20" />
          <div className={`absolute inset-0 ${
            isDark
              ? 'bg-gradient-to-b from-cyber-dark via-cyber-dark/95 to-cyber-dark'
              : 'bg-gradient-to-b from-white via-white/95 to-white'
          }`} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              What Makes{' '}
              <span className="gradient-text">ScrumMaster</span>
              <br />Different
            </h2>
            <div className="w-20 h-1 rounded-full bg-gradient-to-r from-cyber-primary to-cyber-accent mb-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4"
          >
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ScrumMaster is a next-gen AI command center, specializing in automated project decomposition, smart task assignment, and real-time governance. Our agents find the most efficient and reliable team for breathtaking project outcomes.
            </p>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Simply describe your project and set a deadline. Our AI decomposes it into phases, matches tasks to the most suitable team members, and monitors progress in real-time.
            </p>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              We manage 400+ employees with real-time analytics, reliability scoring, and automated governance — from a small automation tool to a full enterprise management platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════ SHOWCASE CARDS (destination-style) ════════════ */}
      <section id="features" className={`relative py-24 px-6 overflow-hidden ${
        isDark ? 'bg-cyber-dark' : 'bg-slate-50'
      }`}>
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              Explore Our{' '}
              <span className="gradient-text">Core Modules</span>
            </h2>
            <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Each module is purpose-built to handle a critical aspect of project management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {showcaseCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.5 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ aspectRatio: '4/3' }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-extrabold text-white mb-1">{card.title}</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${card.color} shadow-lg`}>
                    {card.subtitle}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyber-primary/50 transition-all duration-500" />
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="#all-features"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 font-bold text-sm transition-all duration-300 ${
                isDark
                  ? 'border-cyber-accent text-cyber-accent hover:bg-cyber-accent/10'
                  : 'border-indigo-500 text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Target size={16} />
              See All Features
            </a>
          </div>
        </div>
      </section>

      {/* ════════════ STATS BAR ════════════ */}
      <section className={`py-12 border-y ${
        isDark ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="text-center"
            >
              <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                isDark ? 'bg-white/[0.04]' : 'bg-slate-100'
              }`}>
                <stat.icon size={22} className="text-cyber-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-extrabold gradient-text-primary">{stat.value}</p>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════ ALL FEATURES GRID ════════════ */}
      <section id="all-features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              What We{' '}
              <span className="gradient-text">Offer For You</span>
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

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works" className={`py-24 px-6 ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50'}`}>
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
              { step: '01', title: 'Describe Your Project', desc: 'Enter your project name and description. Set a target deadline.', icon: GitBranch },
              { step: '02', title: 'AI Breaks It Down', desc: 'Gemini AI decomposes your project into phases and subtasks with estimated timelines.', icon: Brain },
              { step: '03', title: 'Smart Assignment', desc: 'ML model matches each task to the best-fit employee based on skills, experience, and workload.', icon: Users },
              { step: '04', title: 'Automated Governance', desc: 'Time Machine enforces deadlines — reliable employees get extensions, others get reassigned.', icon: Clock },
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
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    {item.title}
                    <item.icon size={18} className="text-cyber-accent opacity-60" />
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA — Corporate building bg ════════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.cta} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-cyber-dark/70 to-cyber-dark/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-primary/10 via-transparent to-cyber-secondary/10" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white mb-4"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
          >
            Ready to{' '}
            <span className="gradient-text">Automate</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base mb-8 text-slate-300"
          >
            Join ScrumMaster Command Center and let AI handle the complexity.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={onNavigateToLogin}
            className="btn-primary px-10 py-4 text-lg shadow-2xl shadow-cyber-primary/30 mx-auto"
          >
            <Sparkles size={22} />
            Launch Command Center
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className={`py-8 px-6 border-t text-center ${
        isDark ? 'border-white/[0.04] text-slate-600' : 'border-slate-100 text-slate-400'
      }`}>
        <p className="text-xs font-medium">© 2026 ScrumMaster Command Center — AI-Powered Project Automation</p>
      </footer>
    </div>
  );
};

export default HomePage;
