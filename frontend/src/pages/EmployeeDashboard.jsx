import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Briefcase, Loader2, Target, Calendar, Award, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useApi from '../hooks/useApi';
import { getEmployeeTasks, completeTask } from '../api';
import { PageHeader, GlassCard, StatusBadge, SkillTag, LoadingScreen, ErrorState, ProgressBar } from '../components/ui';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { data, loading, error, refetch } = useApi(() => getEmployeeTasks(user.user_id), [user.user_id]);
  const [completingId, setCompletingId] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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

  if (loading) return <LoadingScreen message="Loading your workspace..." />;
  if (error) return <ErrorState message="Failed to load your tasks." onRetry={refetch} />;

  const tasks = data?.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="p-8 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeader
          icon={Briefcase}
          title={`Welcome,`}
          highlight={user.name}
          subtitle={`${user.domain || 'Employee'} • ${user.experience || 0}Y experience • Reliability: ${user.reliability_score || 100}%`}
        />
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
            isDark 
              ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white/10' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Lock size={16} className="text-cyber-primary" />
          Change Password
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <GlassCard className="p-6 flex items-center gap-4" delay={0.05}>
          <div className="w-12 h-12 rounded-xl bg-cyber-primary/15 flex items-center justify-center">
            <Target size={22} className="text-cyber-primary" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Tasks</p>
            <p className="text-2xl font-extrabold text-white tabular-nums">{tasks.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4" delay={0.1}>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Clock size={22} className="text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">In Progress</p>
            <p className="text-2xl font-extrabold text-white tabular-nums">{activeTasks.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4" delay={0.15}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle size={22} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Completed</p>
            <p className="text-2xl font-extrabold text-white tabular-nums">{completedTasks.length}</p>
          </div>
        </GlassCard>
      </div>

      {/* Progress Bar */}
      <GlassCard className="p-6 mb-8" delay={0.2}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-cyber-accent" />
            <span className="text-sm font-bold text-white">Overall Progress</span>
          </div>
          <span className="text-sm font-extrabold text-cyber-accent tabular-nums">{completionRate}%</span>
        </div>
        <ProgressBar value={completionRate} max={100} color={completionRate >= 70 ? 'emerald' : 'cyber-primary'} />
      </GlassCard>

      {/* Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Tasks */}
        <GlassCard className="p-8" delay={0.25}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock size={18} className="text-amber-400" />
            Active Tasks
            <span className="ml-auto text-[10px] font-bold text-slate-500 bg-white/[0.04] px-2 py-1 rounded-lg">{activeTasks.length}</span>
          </h3>
          <div className="space-y-3">
            {activeTasks.length > 0 ? activeTasks.map((task, idx) => (
              <motion.div
                key={task.task_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{task.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{task.project_name}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={task.status} />
                      {task.deadline_date && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar size={10} /> {task.deadline_date}
                        </span>
                      )}
                    </div>
                    {task.required_skills && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {task.required_skills.slice(0, 3).map(skill => (
                          <SkillTag key={skill} skill={skill} variant="accent" />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleComplete(task.task_id)}
                    disabled={completingId === task.task_id}
                    className="shrink-0 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Mark Complete"
                  >
                    {completingId === task.task_id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                <CheckCircle size={32} className="mx-auto mb-3 opacity-20" />
                All caught up! No active tasks.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Completed Tasks */}
        <GlassCard className="p-8" delay={0.3}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" />
            Completed
            <span className="ml-auto text-[10px] font-bold text-slate-500 bg-white/[0.04] px-2 py-1 rounded-lg">{completedTasks.length}</span>
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {completedTasks.length > 0 ? completedTasks.map((task, idx) => (
              <motion.div
                key={task.task_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-300 line-through decoration-emerald-500/30">{task.title}</p>
                    <p className="text-[10px] text-slate-500">{task.project_name}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No completed tasks yet. Get started!
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default EmployeeDashboard;
