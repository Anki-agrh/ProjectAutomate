import React from 'react';

const ProgressBar = ({ value = 0, max = 100, color = 'cyber-primary', showLabel = false, className = '' }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorMap = {
    'cyber-primary': { bar: 'bg-cyber-primary', glow: 'shadow-[0_0_12px_rgba(99,102,241,0.4)]' },
    'cyber-accent': { bar: 'bg-cyber-accent', glow: 'shadow-[0_0_12px_rgba(34,211,238,0.4)]' },
    'cyber-secondary': { bar: 'bg-cyber-secondary', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]' },
    'emerald': { bar: 'bg-emerald-500', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
    'rose': { bar: 'bg-rose-500', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]' },
  };

  const colors = colorMap[color] || colorMap['cyber-primary'];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Progress</span>
          <span className="font-semibold text-white">{Math.round(percent)}%</span>
        </div>
      )}
      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bar} ${colors.glow} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
