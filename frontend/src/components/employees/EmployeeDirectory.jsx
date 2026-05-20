import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const EmployeeDirectory = ({ employees, selectedId, onSelect, searchTerm, onSearchChange, filterParam = 'all', onFilterChange }) => {
  const benchEmployees = employees.filter(emp => emp.is_on_bench);
  const currentList = filterParam === 'bench' ? benchEmployees : employees;

  const filtered = currentList.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      {onFilterChange && (
        <div className="flex bg-white/[0.02] p-1 rounded-xl">
          <button 
            onClick={() => onFilterChange('all')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${filterParam !== 'bench' ? 'bg-cyber-primary/20 text-cyber-primary' : 'text-slate-500 hover:text-slate-300'}`}
          >
            All Employees ({employees.length})
          </button>
          <button 
            onClick={() => onFilterChange('bench')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${filterParam === 'bench' ? 'bg-cyber-primary/20 text-cyber-primary' : 'text-slate-500 hover:text-slate-300'}`}
          >
            On Bench ({benchEmployees.length})
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          type="text"
          placeholder="Search name, ID, or domain..."
          className="input-base pl-11 rounded-2xl"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="glass-card rounded-2xl overflow-hidden flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
        {filtered.map((emp, idx) => (
          <motion.button
            key={emp.user_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => onSelect(emp.user_id)}
            className={`w-full flex items-center gap-3.5 p-4 transition-all border-b border-white/[0.04] last:border-0 relative group ${
              selectedId === emp.user_id
                ? 'bg-cyber-primary/[0.08]'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            {selectedId === emp.user_id && (
              <motion.div
                layoutId="active-emp"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-cyber-primary neon-glow-primary rounded-r-full"
              />
            )}
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
              selectedId === emp.user_id
                ? 'bg-cyber-primary/20 text-cyber-primary'
                : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
            }`}>
              {emp.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{emp.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                {emp.domain} • {emp.experience}Y exp
              </p>
            </div>

            {/* Score */}
            <div className="shrink-0">
              <p className={`text-sm font-extrabold tabular-nums ${
                (emp.reliability_score || 100) >= 80 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {emp.reliability_score || 100}
              </p>
            </div>
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">No employees found.</div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDirectory;
