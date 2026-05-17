import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProjectCreator from './pages/ProjectCreator';
import ActiveProjects from './pages/ActiveProjects';
import EmployeeBench from './pages/EmployeeBench';
import TimeMachine from './pages/TimeMachine';
import Analytics from './pages/Analytics';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PageTransition from './components/ui/PageTransition';

function App() {
  const { user, login, logout, isLoggedIn, isManager } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  // Not logged in → show HomePage or LoginPage
  if (!isLoggedIn) {
    if (showLogin) {
      return (
        <>
          <Toaster theme={isDark ? 'dark' : 'light'} richColors />
          <LoginPage onLogin={login} onBack={() => setShowLogin(false)} />
        </>
      );
    }
    return (
      <>
        <Toaster theme={isDark ? 'dark' : 'light'} richColors />
        <HomePage onNavigateToLogin={() => setShowLogin(true)} />
      </>
    );
  }

  // Employee view
  if (!isManager) {
    return (
      <div className={`flex min-h-screen overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-cyber-dark text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <Toaster theme={isDark ? 'dark' : 'light'} richColors position="bottom-right" />
        <Sidebar user={user} onLogout={logout} isManager={false} />
        <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto custom-scrollbar">
          {isDark && (
            <>
              <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyber-primary/[0.04] blur-[150px] rounded-full pointer-events-none" />
              <div className="fixed bottom-[-10%] left-[15%] w-[400px] h-[400px] bg-cyber-secondary/[0.03] blur-[120px] rounded-full pointer-events-none" />
            </>
          )}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/my-tasks" replace />} />
              <Route path="/my-tasks" element={<PageTransition><EmployeeDashboard /></PageTransition>} />
              <Route path="*" element={<Navigate to="/my-tasks" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // Manager view (full access)
  return (
    <div className={`flex min-h-screen overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-cyber-dark text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Toaster theme={isDark ? 'dark' : 'light'} richColors position="bottom-right" />
      <Sidebar user={user} onLogout={logout} isManager={true} />
      <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto custom-scrollbar">
        {isDark && (
          <>
            <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyber-primary/[0.04] blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[15%] w-[400px] h-[400px] bg-cyber-secondary/[0.03] blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed top-[40%] right-[30%] w-[250px] h-[250px] bg-cyber-accent/[0.02] blur-[100px] rounded-full pointer-events-none" />
          </>
        )}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/create" element={<PageTransition><ProjectCreator /></PageTransition>} />
            <Route path="/projects" element={<PageTransition><ActiveProjects /></PageTransition>} />
            <Route path="/employees" element={<PageTransition><EmployeeBench /></PageTransition>} />
            <Route path="/overdue" element={<PageTransition><TimeMachine /></PageTransition>} />
            <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
