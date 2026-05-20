import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { manageOverdue } from '../api';
import { PageHeader, GlassCard, LoadingScreen } from '../components/ui';
import SweepResults from '../components/timemachine/SweepResults';

const TimeMachine = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const runAutomaticSweep = async () => {
      setLoading(true);
      try {
        const d = new Date();
        const today = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const res = await manageOverdue({ simulated_today: today, project_id: null });
        if (isMounted) setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    runAutomaticSweep();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="p-8 md:p-10">
      <PageHeader
        icon={Clock}
        title="Overdue"
        highlight="Resolution"
        subtitle="Automatic task extension and reassignment for projects past their deadline."
      />

      <div className="grid grid-cols-1 gap-8">
        <GlassCard className="p-8 min-h-[500px]" delay={0.1}>
          {loading ? (
             <LoadingScreen message="Scanning for overdue tasks and taking automatic action..." />
          ) : (
            <SweepResults results={results} loading={loading} />
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default TimeMachine;
