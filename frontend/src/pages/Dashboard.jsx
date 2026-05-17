import React from 'react';
import { Briefcase, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { getDashboardInfo } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, StatCard, Skeleton, ErrorState } from '../components/ui';
import DeadlineAlerts from '../components/dashboard/DeadlineAlerts';
import BenchStrength from '../components/dashboard/BenchStrength';

const Dashboard = () => {
  const { data, loading, error, refetch } = useApi(getDashboardInfo);

  if (error) return <ErrorState message="Failed to sync with ScrumMaster brain." onRetry={refetch} />;

  return (
    <div className="p-8 md:p-10">
      <PageHeader
        title="Systems"
        highlight="Overview"
        subtitle="Real-time telemetry from your automated project environment."
      />

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
            <BenchStrength skills={data.available_bench_skills} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
