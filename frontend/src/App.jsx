import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProjectCreator from './pages/ProjectCreator';
import ActiveProjects from './pages/ActiveProjects';
import EmployeeBench from './pages/EmployeeBench';
import TimeMachine from './pages/TimeMachine';
import Analytics from './pages/Analytics';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'create':
        return <ProjectCreator />;
      case 'projects':
        return <ActiveProjects />;
      case 'employees':
        return <EmployeeBench />;
      case 'overdue':
        return <TimeMachine />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-cyber-dark text-slate-100 overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto">
        {/* Background Decorative Blobs */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyber-primary/10 blur-[150px] -z-10 rounded-full animate-pulse-slow"></div>
        <div className="fixed bottom-0 left-[20%] w-[300px] h-[300px] bg-cyber-secondary/10 blur-[100px] -z-10 rounded-full"></div>
        
        <div className="relative z-10">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
