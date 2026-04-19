import React, { useState, useEffect } from 'react';
import { getProjects, getProjectGantt, completeTask } from '../api';
import { LayoutGrid, List, Calendar, CheckSquare, Clock } from 'lucide-react';

const GanttChart = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      getProjectGantt(projectId)
        .then(res => {
          setTasks(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [projectId]);

  if (loading) return <div className="p-10 text-center text-slate-500">Generating timeline...</div>;

  return (
    <div className="overflow-x-auto custom-scrollbar pb-4 mt-6">
      <div className="min-w-[800px]">
        {/* Timeline Header (Mock days) */}
        <div className="grid grid-cols-12 mb-4 border-b border-white/5 pb-2">
          <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Task Details</div>
          <div className="col-span-9 grid grid-cols-7 gap-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-[10px] text-center text-slate-600 font-bold uppercase">{day}</div>
            ))}
          </div>
        </div>

        {/* Task Rows */}
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center group">
              <div className="col-span-3 pr-4">
                <p className="text-sm font-semibold truncate text-slate-300 group-hover:text-white transition-colors">{task.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase">{task.assigned_to}</p>
              </div>
              <div className="col-span-9 relative h-8 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`absolute h-full rounded-full flex items-center px-3 text-[10px] font-bold text-white transition-all ${
                    task.progress === 100 
                      ? 'bg-emerald-500/50 border border-emerald-500/40' 
                      : 'bg-cyber-primary/40 border border-cyber-primary/40'
                  }`}
                  style={{ 
                    left: `${(idx % 4) * 10}%`, 
                    width: `${Math.max(30, 100 - (idx * 15))}%` 
                  }}
                >
                  {task.progress === 100 ? 'COMPLETED' : `IN PROGRESS`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActiveProjects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(res => {
        setProjects(res.data);
        if (res.data.length > 0) setSelectedProjectId(res.data[0].project_id);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Projects...</div>;

  return (
    <div className="p-10 animate-in fade-in duration-700">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Active <span className="text-cyber-accent">Engagements</span></h2>
          <p className="text-slate-400 mt-2">Track milestones, deadlines, and AI task distribution.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
           <button className="p-2 text-cyber-accent bg-white/10 rounded-lg"><LayoutGrid size={20}/></button>
           <button className="p-2 text-slate-500"><List size={20}/></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Projects List */}
        <div className="lg:col-span-1 space-y-4">
          {projects.map(proj => (
            <button
              key={proj.project_id}
              onClick={() => setSelectedProjectId(proj.project_id)}
              className={`w-full text-left p-5 rounded-2xl transition-all border ${
                selectedProjectId === proj.project_id 
                  ? 'bg-cyber-primary/20 border-cyber-primary shadow-lg shadow-cyber-primary/10' 
                  : 'glass border-white/5 hover:border-white/10'
              }`}
            >
              <h4 className="font-bold text-white mb-1">{proj.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                  {proj.status || 'Active'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Project Detail & Gantt */}
        <div className="lg:col-span-3 glass rounded-3xl p-8 relative overflow-hidden">
          {selectedProjectId ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyber-primary/10 rounded-xl flex items-center justify-center text-cyber-primary">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">Project Roadmap</h3>
                    <p className="text-sm text-slate-400">Visual Timeline & Task Execution</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Completion</span>
                      <span className="text-lg font-black text-cyber-accent">64%</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-cyber-accent flex items-center justify-center">
                       <CheckSquare size={18} className="text-cyber-accent" />
                    </div>
                </div>
              </div>

              <GanttChart projectId={selectedProjectId} />

              <div className="mt-10 border-t border-white/5 pt-8">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Clock className="text-cyber-secondary" />
                  Execution Backlog
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Here we'd map tasks and allow clicking "Complete" */}
                   <p className="text-slate-500 text-sm italic">Task interaction enabled in individual employee profiles.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
               <Briefcase size={48} className="mb-4 opacity-20" />
               <p>Select a project to view its neural architecture.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveProjects;
