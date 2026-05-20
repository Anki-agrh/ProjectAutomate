import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import { getProjectGantt, completeTask } from '../../api';
import { LoadingScreen, EmptyState, StatusBadge } from '../ui';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

const TaskBacklog = ({ projectId }) => {
  const { data: tasks, loading, refetch } = useApi(
    () => getProjectGantt(projectId),
    [projectId],
    { enabled: !!projectId }
  );
  const [completingId, setCompletingId] = useState(null);

  const handleComplete = async (taskId) => {
    setCompletingId(taskId);
    try {
      await completeTask(taskId);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) return <LoadingScreen message="Loading backlog..." />;
  if (!tasks || tasks.length === 0) return <EmptyState icon={Clock} title="Empty backlog" description="No tasks found for this project." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {tasks.map((task, idx) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{task.name}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-slate-500">{task.assigned_to}</span>
              <StatusBadge status={task.progress === 100 ? 'Completed' : 'Active'} />
              {task.is_extended && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded" title="Extended">EXT</span>
              )}
              {task.is_reassigned && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded" title="Reassigned">REASSIGNED</span>
              )}
            </div>
          </div>
          {task.progress !== 100 && (
            <button
              onClick={() => handleComplete(task.id)}
              disabled={completingId === task.id}
              className="ml-3 shrink-0 p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
              title="Mark as Complete"
            >
              {completingId === task.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default TaskBacklog;
