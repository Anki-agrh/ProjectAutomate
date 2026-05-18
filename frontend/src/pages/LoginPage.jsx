import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { LogIn, Loader2, Shield, Users, AlertCircle, Eye, EyeOff, ArrowLeft, UserPlus, User, Mail, Lock } from 'lucide-react';
import { loginUser, signupUser } from '../api';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';

const LoginPage = ({ onLogin, onBack }) => {
  const { isDark } = useTheme();

  // ── Shared state ──
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Login fields ──
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Register fields ──
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const switchMode = (m) => { setMode(m); setError(''); };

  // ── Login handler ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginUser({ email, password });
      if (res.data.status === 'success') {
        toast.success(res.data.message || 'Login successful!');
        onLogin(res.data);
      } else {
        toast.error(res.data.message || 'Login failed.');
        setError(res.data.message || 'Login failed.');
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Cannot connect to ScrumMaster server.';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Register handler ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await signupUser({ name: regName, email: regEmail, password: regPassword });
      if (res.data.status === 'success') {
        toast.success(res.data.message || 'Account created!');
        onLogin(res.data); // auto-login
      } else {
        toast.error(res.data.message || 'Signup failed.');
        setError(res.data.message || 'Signup failed.');
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Signup failed. Please try again.';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Animation variants ──
  const formVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.25 } },
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ── Left: Background Image Panel (hidden on mobile) ── */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-dark/40 via-cyber-dark/20 to-cyber-dark" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 via-transparent to-cyber-dark/40" />

        {/* Branding overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1
              className="text-5xl xl:text-7xl font-black uppercase text-white leading-[0.9] mb-4"
              style={{
                textShadow: '0 4px 30px rgba(99,102,241,0.4), 0 2px 10px rgba(0,0,0,0.5)',
                fontStyle: 'italic',
              }}
            >
              ScrumMaster
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyber-accent/80">
              Command Center
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Right: Form Area ── */}
      <div className={`flex-1 flex items-center justify-center relative transition-colors duration-500 ${
        isDark ? 'bg-cyber-dark' : 'bg-slate-50'
      }`}>
        {/* Back button + Theme toggle */}
        <div className="fixed top-6 left-6 z-10 flex items-center gap-3 lg:left-auto lg:right-6">
          {onBack && (
            <button
              onClick={onBack}
              className={`p-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <ThemeToggle />
        </div>

        {/* Background Orbs */}
        {isDark && (
          <>
            <div className="floating-orb w-[600px] h-[600px] bg-cyber-primary/20 top-[-20%] right-[-10%] blur-[180px]" />
            <div className="floating-orb w-[500px] h-[500px] bg-cyber-secondary/15 bottom-[-15%] left-[-5%] blur-[150px]" style={{ animationDelay: '-2s' }} />
            <div className="floating-orb w-[300px] h-[300px] bg-cyber-accent/10 top-[30%] left-[40%] blur-[120px]" style={{ animationDelay: '-4s' }} />
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md mx-4"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyber-primary/30"
            >
              <span className="text-2xl font-black text-white italic">S</span>
            </motion.div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ScrumMaster <span className="gradient-text-primary">Command Center</span>
            </h1>
            <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {mode === 'login' ? 'Sign in to access your workspace' : 'Create a new Manager account'}
            </p>
          </div>

          {/* ── Mode Toggle ── */}
          <div className={`flex p-1 rounded-xl mb-6 ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-100 border border-slate-200'}`}>
            {[
              { key: 'login', label: 'Sign In', icon: LogIn },
              { key: 'register', label: 'Register Manager', icon: UserPlus },
            ].map(({ key, label, icon: Ic }) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === key
                    ? 'bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white shadow-md shadow-cyber-primary/20'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Ic size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Form Card ── */}
          <div className="glass-card p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form key="login" variants={formVariants} initial="initial" animate="animate" exit="exit" onSubmit={handleLogin} className="space-y-5">
                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20">
                      <AlertCircle size={16} className="text-rose-400 shrink-0" />
                      <p className="text-sm text-rose-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Email */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        className="input-base pl-10"
                        placeholder="e.g. admin@scrummaster.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="input-base pl-10 pr-12"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-50 mt-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </button>
                </motion.form>
              ) : (
                <motion.form key="register" variants={formVariants} initial="initial" animate="animate" exit="exit" onSubmit={handleRegister} className="space-y-5">
                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20">
                      <AlertCircle size={16} className="text-rose-400 shrink-0" />
                      <p className="text-sm text-rose-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Name */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input
                        id="register-name"
                        type="text"
                        required
                        className="input-base pl-10"
                        placeholder="Your full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input
                        id="register-email"
                        type="email"
                        required
                        className="input-base pl-10"
                        placeholder="you@company.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input
                        id="register-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        className="input-base pl-10 pr-12"
                        placeholder="Create a secure password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className={`text-[10px] mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Minimum 4 characters</p>
                  </div>

                  {/* Info badge */}
                  <div className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${isDark ? 'bg-cyber-primary/[0.06] border border-cyber-primary/10 text-slate-400' : 'bg-indigo-50 border border-indigo-100 text-slate-600'}`}>
                    <Shield size={14} className="text-cyber-primary mt-0.5 shrink-0" />
                    <span>This creates a <strong className={isDark ? 'text-white' : 'text-slate-800'}>Manager</strong> account with full organizational control. Employees are onboarded separately.</span>
                  </div>

                  <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-50 mt-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                    {loading ? 'Creating Account...' : 'Create Manager Account'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Role Hints (only in login mode) */}
          {mode === 'login' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => { setEmail('admin@scrummaster.com'); setPassword('admin'); }}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all text-left group ${
                  isDark
                    ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-cyber-primary/15 flex items-center justify-center shrink-0">
                  <Shield size={14} className="text-cyber-primary" />
                </div>
                <div>
                  <p className={`text-[10px] font-bold group-hover:text-white transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Manager Login</p>
                  <p className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>admin@scrummaster.com</p>
                </div>
              </button>
              <button
                onClick={() => { setEmail(''); setPassword('password123'); }}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all text-left group ${
                  isDark
                    ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-cyber-accent/15 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-cyber-accent" />
                </div>
                <div>
                  <p className={`text-[10px] font-bold group-hover:text-white transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Employee Login</p>
                  <p className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>name@scrummaster.com</p>
                </div>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
