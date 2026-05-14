import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Loader2, Shield, Users, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { loginUser } from '../api';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';

const LoginPage = ({ onLogin, onBack }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginUser({ email, password });
      if (res.data.status === 'success') {
        onLogin(res.data.user);
      } else {
        setError(res.data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Cannot connect to ScrumMaster server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-cyber-dark' : 'bg-slate-50'
    }`}>
      {/* Back button + Theme toggle */}
      <div className="fixed top-6 left-6 z-10 flex items-center gap-3">
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
          <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyber-primary/[0.06] blur-[180px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-15%] left-[-5%] w-[500px] h-[500px] bg-cyber-secondary/[0.05] blur-[150px] rounded-full pointer-events-none" />
          <div className="fixed top-[30%] left-[40%] w-[300px] h-[300px] bg-cyber-accent/[0.03] blur-[120px] rounded-full pointer-events-none" />
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            ScrumMaster <span className="gradient-text-primary">Command Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to access your workspace</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20"
              >
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
                <p className="text-sm text-rose-400">{error}</p>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                className="input-base"
                placeholder="e.g. admin@scrummaster.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-base pr-12"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Role Hints */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => { setEmail('admin@scrummaster.com'); setPassword('admin'); }}
            className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyber-primary/15 flex items-center justify-center shrink-0">
              <Shield size={14} className="text-cyber-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">Manager Login</p>
              <p className="text-[9px] text-slate-500">admin@scrummaster.com</p>
            </div>
          </button>
          <button
            onClick={() => { setEmail(''); setPassword('password123'); }}
            className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyber-accent/15 flex items-center justify-center shrink-0">
              <Users size={14} className="text-cyber-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">Employee Login</p>
              <p className="text-[9px] text-slate-500">name@scrummaster.com</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
