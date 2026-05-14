import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import { getProjectGantt } from '../../api';
import { LoadingScreen, EmptyState } from '../ui';
import { Calendar } from 'lucide-react';

// Helper: parse "YYYY-MM-DD" to Date
const parseDate = (str) => {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Helper: format date as "May 12"
const formatShortDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper: diff in days
const daysBetween = (a, b) => Math.round((b - a) / (1000 * 60 * 60 * 24));

const GanttChart = ({ projectId }) => {
  const { data: tasks, loading } = useApi(
    () => getProjectGantt(projectId),
    [projectId],
    { enabled: !!projectId }
  );

  // Compute timeline bounds from task data
  const { dateColumns, minDate, totalDays } = useMemo(() => {
    if (!tasks || tasks.length === 0) return { dateColumns: [], minDate: new Date(), totalDays: 1 };

    let earliest = Infinity;
    let latest = -Infinity;

    tasks.forEach((task) => {
      const startMs = parseDate(task.start).getTime();
      const endMs = parseDate(task.end).getTime();
      if (startMs < earliest) earliest = startMs;
      if (endMs > latest) latest = endMs;
    });

    const minD = new Date(earliest);
    const maxD = new Date(latest);
    const totalD = Math.max(daysBetween(minD, maxD), 1);

    // Generate column dates (show up to 10 labels spread evenly)
    const maxCols = Math.min(totalD + 1, 10);
    const step = Math.max(1, Math.floor(totalD / (maxCols - 1)));
    const cols = [];
    for (let i = 0; i <= totalD; i += step) {
      const d = new Date(minD);
      d.setDate(d.getDate() + i);
      cols.push(d);
    }
    // Ensure last date is included
    const lastCol = cols[cols.length - 1];
    if (daysBetween(lastCol, maxD) > 0) {
      cols.push(maxD);
    }

    return { dateColumns: cols, minDate: minD, totalDays: totalD };
  }, [tasks]);

  if (loading) return <LoadingScreen message="Generating timeline..." />;
  if (!tasks || tasks.length === 0) return <EmptyState icon={Calendar} title="No tasks" description="This project has no tasks assigned yet." />;

  return (
    <div className="overflow-x-auto custom-scrollbar pb-4 mt-6">
      <div className="min-w-[700px]">
        {/* Timeline Header */}
        <div className="flex mb-4 border-b border-white/[0.04] pb-3">
          <div className="w-[35%] shrink-0 text-[10px] font-bold text-slate-500 uppercase tracking-widest pr-4">
            Task Details
          </div>
          <div className="flex-1 flex items-end justify-between px-1">
            {dateColumns.map((d, i) => (
              <div key={i} className="text-[9px] text-center text-slate-500 font-bold uppercase whitespace-nowrap">
                {formatShortDate(d)}
              </div>
            ))}
          </div>
        </div>

        {/* Task Rows */}
        <div className="space-y-2">
          {tasks.map((task, idx) => {
            const taskStart = parseDate(task.start);
            const taskEnd = parseDate(task.end);
            const offsetDays = daysBetween(minDate, taskStart);
            const durationDays = Math.max(daysBetween(taskStart, taskEnd), 1);
            const leftPct = (offsetDays / totalDays) * 100;
            const widthPct = Math.max((durationDays / totalDays) * 100, 8); // min 8% width for visibility

            return (
              <motion.div
                key={task.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center group"
              >
                <div className="w-[35%] shrink-0 pr-4">
                  <p className="text-sm font-semibold truncate text-slate-300 group-hover:text-white transition-colors">
                    {task.name}
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">{task.assigned_to}</p>
                </div>
                <div className="flex-1 relative h-9 bg-white/[0.02] rounded-lg overflow-hidden">
                  {/* Grid lines at each column */}
                  {dateColumns.map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-white/[0.03]"
                      style={{ left: `${(i / (dateColumns.length - 1)) * 100}%` }}
                    />
                  ))}
                  {/* Task bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    className={`absolute h-full rounded-lg flex items-center px-3 text-[9px] font-bold text-white ${
                      task.progress === 100
                        ? 'bg-emerald-500/40 border border-emerald-500/30'
                        : 'bg-cyber-primary/30 border border-cyber-primary/30'
                    }`}
                    style={{ left: `${leftPct}%` }}
                  >
                    <span className="truncate">
                      {task.progress === 100 ? '✓ DONE' : formatShortDate(taskEnd)}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
