import React from 'react';
import { motion } from 'framer-motion';
import { Home, PlusSquare, Folder, Users, Zap, BarChart3, ChevronRight, LogOut, Briefcase, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ui/ThemeToggle';

import { useNavigate, useLocation } from 'react-router-dom';

const managerNavItems = [
  { id: '/dashboard', label: 'Dashboard', icon: Home },
  { id: '/create', label: 'Create Project', icon: PlusSquare },
  { id: '/projects', label: 'Active Projects', icon: Folder },
  { id: '/employees', label: 'All Employees', icon: Users },
  { id: '/overdue', label: 'Time Machine', icon: Zap },
  { id: '/analytics', label: 'System Analytics', icon: BarChart3 },
];

const employeeNavItems = [
  { id: '/my-tasks', label: 'My Tasks', icon: Briefcase },
];

const SidebarItem = ({ icon: Icon, label, active, onClick, isDark }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
      active
        ? isDark
          ? 'bg-cyber-primary/[0.12] text-white'
          : 'bg-indigo-50 text-indigo-700'
        : isDark
          ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
    }`}
  >
    {active && (
      <motion.div
        layoutId="sidebar-indicator"
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${
          isDark ? 'bg-cyber-primary neon-glow-primary' : 'bg-indigo-500'
        }`}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      />
    )}
    <Icon size={18} strokeWidth={active ? 2.2 : 1.6} className="shrink-0 transition-all" />
    <span className={`text-sm ${active ? 'font-bold' : 'font-medium'} transition-all`}>{label}</span>
    {active && <ChevronRight size={14} className={`ml-auto opacity-60 ${isDark ? 'text-cyber-primary' : 'text-indigo-500'}`} />}
  </motion.button>
);

const Sidebar = ({ user, onLogout, isManager }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = isManager ? managerNavItems : employeeNavItems;

  return (
    <div className={`w-64 h-screen flex flex-col fixed left-0 top-0 z-50 transition-colors duration-500 ${
      isDark
        ? 'bg-white/[0.01] backdrop-blur-2xl border-r border-white/[0.05]'
        : 'bg-white border-r border-slate-200'
    }`}>
      {/* Logo + Theme Toggle */}
      <div className="flex items-center justify-between px-6 py-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center font-extrabold text-sm text-white shadow-lg shadow-cyber-primary/20">
            S
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight uppercase leading-none">ScrumMaster</h1>
            <p className="text-[9px] text-cyber-accent font-bold uppercase tracking-[0.2em] leading-none mt-0.5">Command Center</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Role Badge */}
      <div className={`mx-3 mb-4 px-4 py-2.5 rounded-xl flex items-center gap-2.5 ${
        isDark
          ? 'bg-white/[0.02] border border-white/[0.05]'
          : 'bg-slate-50 border border-slate-100'
      }`}>
        <Shield size={14} className={isManager ? 'text-cyber-primary' : 'text-cyber-accent'} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {isManager ? 'Manager View' : 'Employee View'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
        <p className={`text-[9px] font-bold uppercase tracking-widest px-4 mb-2 ${
          isDark ? 'text-slate-600' : 'text-slate-400'
        }`}>Navigation</p>
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            {...item}
            active={location.pathname === item.id}
            onClick={() => navigate(item.id)}
            isDark={isDark}
          />
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className={`p-4 border-t space-y-3 ${
        isDark ? 'border-white/[0.05]' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyber-primary to-cyber-secondary p-[1.5px] shrink-0">
            <div className={`w-full h-full rounded-xl flex items-center justify-center text-[10px] font-bold text-white ${
              isDark ? 'bg-cyber-dark' : 'bg-white'
            }`}>
              <span className={isDark ? 'text-white' : 'text-indigo-600'}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
            <p className={`text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
            isDark
              ? 'bg-white/[0.03] border-white/[0.05] text-slate-400 hover:text-rose-400 hover:bg-rose-500/[0.06] hover:border-rose-500/20'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200'
          }`}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
