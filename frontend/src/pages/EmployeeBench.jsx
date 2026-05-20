import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, UserPlus, FilterX } from 'lucide-react';
import { getEmployees } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, LoadingScreen, ErrorState } from '../components/ui';
import EmployeeDirectory from '../components/employees/EmployeeDirectory';
import EmployeeProfile from '../components/employees/EmployeeProfile';
import OnboardModal from '../components/employees/OnboardModal';

const EmployeeBench = () => {
  const { data: employees, loading, error, refetch } = useApi(getEmployees);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filterParam = searchParams.get('filter') || 'all';
  
  const displayedEmployees = employees || [];

  // Auto-select first employee
  useEffect(() => {
    if (displayedEmployees.length > 0) {
      const listToSelectFrom = filterParam === 'bench' ? displayedEmployees.filter(e => e.is_on_bench) : displayedEmployees;
      if (listToSelectFrom.length > 0) {
        const isSelectedInList = listToSelectFrom.some(e => e.user_id === selectedEmpId);
        if (!selectedEmpId || !isSelectedInList) {
          setSelectedEmpId(listToSelectFrom[0].user_id);
        }
      } else if (listToSelectFrom.length === 0 && selectedEmpId) {
        setSelectedEmpId(null);
      }
    }
  }, [displayedEmployees, selectedEmpId, filterParam]);

  if (loading) return <LoadingScreen message="Syncing personnel database..." />;
  if (error) return <ErrorState message="Failed to load employees." onRetry={refetch} />;

  const selectedEmp = employees?.find(e => e.user_id === selectedEmpId);

  return (
    <div className="p-8 md:p-10">
      <PageHeader
        icon={Users}
        title="Employee"
        highlight="Directory"
        subtitle="Browse all employees — reliability metrics, skill inventories, and resource allocation."
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary py-2 px-4 text-sm"
          >
            <UserPlus size={16} />
            Onboard Personnel
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Directory */}
        <div className="lg:col-span-4">
          <EmployeeDirectory
            employees={displayedEmployees}
            selectedId={selectedEmpId}
            onSelect={setSelectedEmpId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterParam={filterParam}
            onFilterChange={(val) => setSearchParams(val === 'all' ? {} : { filter: val })}
          />
        </div>

        {/* Right: Profile */}
        <div className="lg:col-span-8">
          {selectedEmp ? (
            <EmployeeProfile employee={selectedEmp} />
          ) : (
            <div className="glass-card rounded-2xl h-full flex flex-col items-center justify-center text-slate-500 py-32">
              <Users size={56} className="mb-4 opacity-10" />
              <p className="text-sm">Select a candidate to view their professional telemetry.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <OnboardModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              refetch();
              setSelectedEmpId(null); // Reset selection to see newest maybe, or let auto-select handle it
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick addition of AnimatePresence to imports
import { AnimatePresence } from 'framer-motion';

export default EmployeeBench;
