import React from 'react';
import { BarChart3 } from 'lucide-react';
import { getSkillGap, getAnalyticsOverview } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, LoadingScreen, ErrorState } from '../components/ui';
import ResourceImbalanceChart from '../components/analytics/ResourceImbalanceChart';
import AnalyticsKPIRow from '../components/analytics/AnalyticsKPIRow';
import ProjectHealthGrid from '../components/analytics/ProjectHealthGrid';
import DeadlineRiskChart from '../components/analytics/DeadlineRiskChart';

const Analytics = () => {
  const { data: skillGap, loading: l1, error: e1, refetch: r1 } = useApi(getSkillGap);
  const { data: overview, loading: l2, error: e2, refetch: r2 } = useApi(getAnalyticsOverview);

  const loading = l1 || l2;
  const error = e1 || e2;

  if (loading) return <LoadingScreen message="Crunching analytics..." />;
  if (error) return <ErrorState message="Failed to load analytics data." onRetry={() => { r1(); r2(); }} />;

  return (
    <div className="p-8 md:p-10">
      <PageHeader
        icon={BarChart3}
        title="System"
        highlight="Analytics"
        subtitle="Deep-dive into resource utilization, project health, and organizational performance."
      />

      {/* KPI Summary */}
      <AnalyticsKPIRow kpis={overview?.kpis || {}} />

      {/* Row 1: Project Health */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <ProjectHealthGrid data={overview?.project_health || []} />
      </div>

      {/* Row 2: Resource Imbalance (full width) */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <ResourceImbalanceChart data={skillGap || []} />
      </div>

      {/* Row 3: Deadline Risk (full width) */}
      <div className="grid grid-cols-1 gap-8">
        <DeadlineRiskChart
          data={overview?.deadline_risk || []}
          summary={overview?.deadline_summary || {}}
        />
      </div>
    </div>
  );
};

export default Analytics;
