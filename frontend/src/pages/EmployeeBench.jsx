import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { getEmployees } from '../api';
import useApi from '../hooks/useApi';
import { PageHeader, LoadingScreen, ErrorState } from '../components/ui';
import EmployeeDirectory from '../components/employees/EmployeeDirectory';
import EmployeeProfile from '../components/employees/EmployeeProfile';

const EmployeeBench = () => {
  const { data: employees, loading, error, refetch } = useApi(getEmployees);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-select first employee
  if (employees && employees.length > 0 && !selectedEmpId) {
    setSelectedEmpId(employees[0].user_id);
  }

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
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Directory */}
        <div className="lg:col-span-4">
          <EmployeeDirectory
            employees={employees || []}
            selectedId={selectedEmpId}
            onSelect={setSelectedEmpId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
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
    </div>
  );
};

export default EmployeeBench;
