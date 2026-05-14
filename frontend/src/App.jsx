import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function App() {
  const { user, login, logout, isLoggedIn, isManager } = useAuth();
  const { isDark } = useTheme();
  const [activePage, setActivePage] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  // Not logged in → show HomePage or LoginPage
  if (!isLoggedIn) {
    if (showLogin) {
      return <LoginPage onLogin={login} onBack={() => setShowLogin(false)} />;
    }
    return <HomePage onNavigateToLogin={() => setShowLogin(true)} />;
  }

  // Employee view
  if (!isManager) {
    return (
      <div className={`flex min-h-screen overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-cyber-dark text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} onLogout={logout} isManager={false} />
        <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto custom-scrollbar">
          {isDark && (
            <>
              <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyber-primary/[0.04] blur-[150px] rounded-full pointer-events-none" />
              <div className="fixed bottom-[-10%] left-[15%] w-[400px] h-[400px] bg-cyber-secondary/[0.03] blur-[120px] rounded-full pointer-events-none" />
            </>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10"
            >
              {activePage === 'my-tasks' ? <EmployeeDashboard /> : <EmployeeDashboard />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // Manager view (full access)
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'create': return <ProjectCreator />;
      case 'projects': return <ActiveProjects />;
      case 'employees': return <EmployeeBench />;
      case 'overdue': return <TimeMachine />;
      case 'analytics': return <Analytics />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`flex min-h-screen overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-cyber-dark text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} onLogout={logout} isManager={true} />
      <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto custom-scrollbar">
        {isDark && (
          <>
            <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyber-primary/[0.04] blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[15%] w-[400px] h-[400px] bg-cyber-secondary/[0.03] blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed top-[40%] right-[30%] w-[250px] h-[250px] bg-cyber-accent/[0.02] blur-[100px] rounded-full pointer-events-none" />
          </>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
