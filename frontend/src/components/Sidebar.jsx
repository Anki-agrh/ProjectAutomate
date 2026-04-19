import React from 'react';
import { Home, PlusSquare, Folder, Users, Zap, BarChart3 } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-cyber-primary text-white shadow-lg shadow-cyber-primary/20' 
        : 'hover:bg-white/5 text-slate-400 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar = ({ activePage, setActivePage }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'create', label: 'Create Project', icon: PlusSquare },
    { id: 'projects', label: 'Active Projects', icon: Folder },
    { id: 'employees', label: 'Employee Bench', icon: Users },
    { id: 'overdue', label: 'Time Machine', icon: Zap },
    { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 h-screen glass border-r border-white/10 flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-2 mb-10 mt-4">
        <div className="w-8 h-8 rounded bg-cyber-primary flex items-center justify-center font-bold text-lg italic">A</div>
        <h1 className="text-xl font-bold tracking-tight text-white uppercase">Apex <span className="text-cyber-accent">Project</span></h1>
      </div>
      
      <nav className="flex-1 flex flex-col gap-2">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            {...item}
            active={activePage === item.id}
            onClick={() => setActivePage(item.id)}
          />
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyber-primary to-cyber-secondary p-[2px]">
            <div className="w-full h-full rounded-full bg-cyber-dark overflow-hidden flex items-center justify-center text-xs">
              MGR
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Manager Perspective</p>
            <p className="text-xs text-slate-500">System Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
