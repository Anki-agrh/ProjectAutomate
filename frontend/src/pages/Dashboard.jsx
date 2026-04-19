import React, { useState, useEffect } from 'react';
import { getDashboardInfo } from '../api';
import { Briefcase, CheckCircle, Users, AlertCircle, Calendar } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass p-6 rounded-2xl flex items-center gap-5 border border-white/5 hover:border-white/10 transition-colors">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardInfo()
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400">Loading neural nodes...</div>;
  if (!data) return <div className="p-10 text-center text-red-400">Failed to sync with APEX brain.</div>;

  return (
    <div className="p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Systems <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-primary to-cyber-accent">Overview</span></h2>
        <p className="text-slate-400 mt-2">Real-time telemetry from your automated project environment.</p>
      </header>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={Briefcase} 
          label="Total Projects" 
          value={data.overview.total_projects} 
          color="bg-indigo-500/20 text-indigo-400"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Active Tasks" 
          value={data.overview.total_active_tasks} 
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard 
          icon={Users} 
          label="Employees on Bench" 
          value={data.overview.total_employees_on_bench} 
          color="bg-cyan-500/20 text-cyan-400"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Tasks Due Soon" 
          value={data.alerts.tasks_due_soon_count} 
          color="bg-rose-500/20 text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent Alerts */}
        <div className="lg:col-span-2 glass rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-cyber-accent" />
              Deadline Alerts
            </h3>
            <button className="text-xs text-cyber-accent hover:underline">View all tasks</button>
          </div>
          
          <div className="space-y-4">
            {data.alerts.tasks_due_soon.length > 0 ? (
              data.alerts.tasks_due_soon.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-md font-semibold text-white">{alert.task}</p>
                    <p className="text-xs text-slate-500">Employee ID: {alert.assigned_to}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-400">Due {alert.deadline}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Immediate action required</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-10">No immediate deadlines detected.</p>
            )}
          </div>
        </div>

        {/* Bench Skills */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="text-cyber-secondary" />
            Bench Strength
          </h3>
          <div className="space-y-4">
            {Object.entries(data.available_bench_skills).length > 0 ? (
              Object.entries(data.available_bench_skills).map(([skill, count]) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 font-medium">{skill}</span>
                    <span className="text-cyber-accent font-bold">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyber-accent shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                      style={{ width: `${Math.min(100, (count / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-10">All hands on deck. No idle skills.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
