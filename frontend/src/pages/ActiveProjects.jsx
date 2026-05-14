import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, Clock, Folder } from 'lucide-react';
import { getProjects } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, LoadingScreen, ErrorState, GlassCard } from '../components/ui';
import ProjectCard from '../components/projects/ProjectCard';
import GanttChart from '../components/projects/GanttChart';
import TaskBacklog from '../components/projects/TaskBacklog';

const ActiveProjects = () => {
  const { data: projects, loading, error, refetch } = useApi(getProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Auto-select first project
  if (projects && projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0].project_id);
  }

  if (loading) return <LoadingScreen message="Loading projects..." />;
  if (error) return <ErrorState message="Failed to load projects." onRetry={refetch} />;

  const selectedProject = projects?.find(p => p.project_id === selectedProjectId);

  return (
    <div className="p-8 md:p-10">
      <PageHeader
        icon={Folder}
        title="Active"
        highlight="Engagements"
        subtitle="Track milestones, deadlines, and AI task distribution."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Project List */}
        <div className="lg:col-span-1 space-y-3">
          {(projects || []).map((proj, idx) => (
            <ProjectCard
              key={proj.project_id}
              project={proj}
              index={idx}
              isSelected={selectedProjectId === proj.project_id}
              onClick={() => setSelectedProjectId(proj.project_id)}
            />
          ))}
          {(!projects || projects.length === 0) && (
            <div className="text-sm text-slate-500 text-center py-10">No projects found.</div>
          )}
        </div>

        {/* Main: Project Detail & Gantt */}
        <div className="lg:col-span-3">
          <GlassCard className="p-8 relative overflow-hidden min-h-[500px]" delay={0.1}>
            {selectedProject ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-cyber-primary/10 rounded-xl flex items-center justify-center text-cyber-primary">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{selectedProject.name}</h3>
                      <p className="text-xs text-slate-500">Visual Timeline & Task Execution</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-[3px] border-white/[0.06] border-t-cyber-accent flex items-center justify-center">
                      <CheckSquare size={16} className="text-cyber-accent" />
                    </div>
                  </div>
                </div>

                {/* Gantt Chart */}
                <GanttChart projectId={selectedProjectId} />

                {/* Task Backlog */}
                <div className="mt-10 border-t border-white/[0.05] pt-8">
                  <h4 className="text-base font-bold mb-6 flex items-center gap-2">
                    <Clock size={16} className="text-cyber-secondary" />
                    Execution Backlog
                  </h4>
                  <TaskBacklog projectId={selectedProjectId} />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-32">
                <Folder size={48} className="mb-4 opacity-20" />
                <p>Select a project to view its architecture.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ActiveProjects;
