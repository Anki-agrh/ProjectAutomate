import React from 'react';
import { BarChart3 } from 'lucide-react';
import { getSkillGap, getAnalyticsOverview } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, Skeleton, ErrorState } from '../components/ui';
import ResourceImbalanceChart from '../components/analytics/ResourceImbalanceChart';
import AnalyticsKPIRow from '../components/analytics/AnalyticsKPIRow';
import ProjectHealthGrid from '../components/analytics/ProjectHealthGrid';
import DeadlineRiskChart from '../components/analytics/DeadlineRiskChart';

const Analytics = () => {
  const { data: skillGap, loading: l1, error: e1, refetch: r1 } = useApi(getSkillGap);
  const { data: overview, loading: l2, error: e2, refetch: r2 } = useApi(getAnalyticsOverview);

  const loading = l1 || l2;
  const error = e1 || e2;

  if (error) return <ErrorState message="Failed to load analytics data." onRetry={() => { r1(); r2(); }} />;

  return (
    <div className="p-8 md:p-10 max-w-[1600px] mx-auto">
      <PageHeader
        icon={BarChart3}
        title="System"
        highlight="Analytics"
        subtitle="Deep-dive into resource utilization, project health, and organizational performance."
      />

      {loading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Skeleton className="h-[450px] w-full" />
            <Skeleton className="h-[450px] w-full" />
          </div>
          <Skeleton className="h-[500px] w-full" />
        </>
      ) : (
        <>
          {/* KPI Summary */}
          <AnalyticsKPIRow kpis={overview?.kpis || {}} />

          {/* Top Row: Health & Imbalance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ProjectHealthGrid data={overview?.project_health || []} />
            <ResourceImbalanceChart data={skillGap || []} />
          </div>

          {/* Bottom Row: Deadline Risk (Full Width) */}
          <div className="grid grid-cols-1 gap-8">
            <DeadlineRiskChart
              data={overview?.deadline_risk || []}
              summary={overview?.deadline_summary || {}}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
