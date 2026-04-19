import React, { useState, useEffect } from 'react';
import { getEmployees, getGrowthTrend } from '../api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { User, Award, TrendingUp, Search, Mail } from 'lucide-react';

const GrowthTrendChart = ({ userId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      getGrowthTrend(userId)
        .then(res => {
          setData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading) return <div className="h-40 flex items-center justify-center text-xs text-slate-500">Loading growth telemetry...</div>;
  if (data.length === 0) return <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">Insufficient historical data to calculate trends.</div>;

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="date" 
            hide 
          />
          <YAxis 
            domain={[0, 100]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
            itemStyle={{ color: '#22d3ee' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ fill: '#6366f1', r: 4 }}
            activeDot={{ r: 6, fill: '#22d3ee' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const EmployeeBench = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getEmployees()
      .then(res => {
        setEmployees(res.data);
        if (res.data.length > 0) setSelectedEmpId(res.data[0].user_id);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmp = employees.find(e => e.user_id === selectedEmpId);

  if (loading) return <div className="p-10 text-center">Syncing Personnel Database...</div>;

  return (
    <div className="p-10 animate-in fade-in slide-in-from-right-4 duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Personnel <span className="text-cyber-accent">Intelligence</span></h2>
        <p className="text-slate-400 mt-2">Manage reliability metrics, skill inventories, and resource allocation.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Employee Directory */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-cyber-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="glass rounded-3xl overflow-hidden flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredEmployees.map(emp => (
              <button
                key={emp.user_id}
                onClick={() => setSelectedEmpId(emp.user_id)}
                className={`w-full flex items-center gap-4 p-5 transition-all border-b border-white/5 last:border-0 ${
                  selectedEmpId === emp.user_id ? 'bg-cyber-primary/10 border-r-4 border-r-cyber-primary' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/10">
                  {emp.name.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{emp.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{emp.domain} • {emp.experience}Y</p>
                </div>
                <div className="text-right">
                   <p className={`text-sm font-black ${emp.reliability_score >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {emp.reliability_score || 100}
                   </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Profile Details & Growth Chart */}
        <div className="lg:col-span-8 space-y-8">
          {selectedEmp ? (
            <>
              <div className="glass rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-primary/5 blur-[80px] -z-10"></div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyber-primary to-cyber-secondary p-[2px]">
                    <div className="w-full h-full rounded-3xl bg-cyber-dark flex items-center justify-center">
                       <User size={64} className="text-white/20" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-3xl font-black text-white">{selectedEmp.name}</h3>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">Available</span>
                    </div>
                    <p className="text-slate-400 font-medium mb-6 uppercase tracking-[0.2em] text-xs underline decoration-cyber-primary underline-offset-8 decoration-2">
                       {selectedEmp.role}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mt-8">
                       <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Quality Score</p>
                          <p className="text-xl font-bold text-white">{selectedEmp.avg_quality_score || 'N/A'}</p>
                       </div>
                       <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Assigned Tasks</p>
                          <p className="text-xl font-bold text-white">0</p>
                       </div>
                       <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Reliability</p>
                          <p className="text-xl font-bold text-emerald-400">{selectedEmp.reliability_score || 100}%</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                     <button className="flex items-center gap-2 bg-cyber-primary hover:bg-cyber-primary/80 transition-colors px-6 py-3 rounded-xl font-bold text-sm">
                        <Award size={18} /> Endorse Skills
                     </button>
                     <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors px-6 py-3 rounded-xl font-bold text-sm text-slate-300">
                        <Mail size={18} /> Contact Employee
                     </button>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Skills Cloud */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Core Competencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmp.skills.map(skill => (
                        <span key={skill} className="bg-cyber-accent/10 text-cyber-accent text-xs px-4 py-2 rounded-lg font-bold border border-cyber-accent/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Growth Trend */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TrendingUp size={16} /> Performance Velocity
                    </h4>
                    <GrowthTrendChart userId={selectedEmp.user_id} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-32 glass rounded-3xl">
               <Users size={64} className="mb-4 opacity-10" />
               <p>Select a candidate to view their professional telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeBench;
