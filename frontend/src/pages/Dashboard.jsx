import React, { useState } from 'react';
import { Briefcase, CheckCircle, Users, AlertCircle, Lock, AlertTriangle } from 'lucide-react';
import { getDashboardInfo } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, StatCard, Skeleton, ErrorState } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import DeadlineAlerts from '../components/dashboard/DeadlineAlerts';
import BenchStrength from '../components/dashboard/BenchStrength';
import WorkloadHeatmap from '../components/dashboard/WorkloadHeatmap';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';

const Dashboard = () => {
  const { isDark } = useTheme();
  const { data, loading, error, refetch } = useApi(getDashboardInfo);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (error) return <ErrorState message="Failed to sync with ScrumMaster brain." onRetry={refetch} />;

  return (
    <div className="p-8 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeader
          title="Systems"
          highlight="Overview"
          subtitle="Real-time telemetry from your automated project environment."
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

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px] w-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </>
      ) : (
        <>
          {data.system_alert && (
            <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-4 shadow-lg shadow-rose-500/5">
              <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-500 mb-1">Capacity Warning</h4>
                <p className="text-sm text-rose-400/90 leading-relaxed">{data.system_alert}</p>
              </div>
            </div>
          )}

          {/* Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatCard icon={Briefcase} label="Total Projects" value={data.overview.total_projects} color="bg-indigo-500/15 text-indigo-400" delay={0.05} />
            <StatCard icon={CheckCircle} label="Active Tasks" value={data.overview.total_active_tasks} color="bg-emerald-500/15 text-emerald-400" delay={0.1} />
            <StatCard icon={Users} label="On Bench" value={data.overview.total_employees_on_bench} color="bg-cyan-500/15 text-cyan-400" delay={0.15} />
            <StatCard icon={AlertCircle} label="Due Soon" value={data.alerts.tasks_due_soon_count} color="bg-rose-500/15 text-rose-400" delay={0.2} />
          </div>

          {/* Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DeadlineAlerts alerts={data.alerts.tasks_due_soon} />
            </div>
            {data.overview.total_employees_on_bench === 0 ? (
              <WorkloadHeatmap workforce={data.overloaded_workforce} />
            ) : (
              <BenchStrength skills={data.available_bench_skills} />
            )}
          </div>
        </>
      )}

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
