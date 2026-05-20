import React, { useState } from 'react';
import { Trophy, Star, TrendingDown, TrendingUp, Search } from 'lucide-react';
import { getEmployeeRankings } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, LoadingScreen, ErrorState, GlassCard } from '../components/ui';

const Rankings = () => {
  const { data: rankings, loading, error, refetch } = useApi(getEmployeeRankings);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <LoadingScreen message="Calculating dynamic performance rankings..." />;
  if (error) return <ErrorState message="Failed to load rankings." onRetry={refetch} />;

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'Top Performer': return <Star size={16} className="text-emerald-400" />;
      case 'Solid Contributor': return <TrendingUp size={16} className="text-blue-400" />;
      case 'Needs Improvement': return <TrendingDown size={16} className="text-rose-400" />;
      default: return null;
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Top Performer': return 'text-emerald-400';
      case 'Solid Contributor': return 'text-blue-400';
      case 'Needs Improvement': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const filteredRankings = rankings?.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 md:p-10">
      <PageHeader
        icon={Trophy}
        title="Employee"
        highlight="Rankings"
        subtitle="Dynamic manager-only leaderboard based on delivery metrics and task history."
      >
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search employee or domain..."
            className="input-base pl-11 pr-4 py-2 w-full text-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {rankings && rankings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <Trophy size={64} className="mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">No rankings available</p>
        </div>
      ) : (
        <GlassCard className="mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Completed Tasks (+2)</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Extended Tasks (-5)</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Reassigned (-15)</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredRankings?.map((emp) => (
                  <tr key={emp.user_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center font-bold text-white text-sm">
                        #{emp.rank}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{emp.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">{emp.domain}</div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 text-xs font-bold ${getTierColor(emp.tier)}`}>
                        {getTierIcon(emp.tier)}
                        {emp.tier}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-400">
                      {emp.completed_tasks > 0 ? `+${emp.completed_tasks}` : '0'}
                    </td>
                    <td className="p-4 text-center font-bold text-amber-400">
                      {emp.extended_tasks > 0 ? `-${emp.extended_tasks}` : '0'}
                    </td>
                    <td className="p-4 text-center font-bold text-rose-400">
                      {emp.reassigned_tasks > 0 ? `-${emp.reassigned_tasks}` : '0'}
                    </td>
                    <td className={`p-4 text-right font-black text-lg ${getTierColor(emp.tier)}`}>
                      {emp.final_score}
                    </td>
                  </tr>
                ))}
                {filteredRankings?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-slate-500 font-semibold">
                      No matching employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Rankings;
