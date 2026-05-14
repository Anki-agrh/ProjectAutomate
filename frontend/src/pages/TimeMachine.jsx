import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { manageOverdue, getProjects } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, GlassCard } from '../components/ui';
import SweepControls from '../components/timemachine/SweepControls';
import SweepResults from '../components/timemachine/SweepResults';

const TimeMachine = () => {
  const [simulatedDate, setSimulatedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const { data: projects } = useApi(getProjects);

  const handleSweep = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await manageOverdue({ simulated_today: simulatedDate, project_id: projectId || null });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert('Temporal anomaly detected. Could not process overdue tasks.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-10">
      <PageHeader
        icon={Zap}
        title="Time"
        highlight="Machine"
        subtitle="Simulate the passage of time. ScrumMaster will trigger midnight sweeps, reassigning tasks and extending deadlines."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <SweepControls
            simulatedDate={simulatedDate}
            projectId={projectId}
            projects={projects}
            onDateChange={setSimulatedDate}
            onProjectIdChange={setProjectId}
            onSweep={handleSweep}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-8">
          <GlassCard className="p-8 min-h-[500px]" delay={0.1}>
            <SweepResults results={results} loading={loading} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TimeMachine;
