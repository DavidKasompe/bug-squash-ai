
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BugReport } from '@/types/bugs';
import BugConfirmModal from '@/components/dashboard/BugConfirmModal';
import BugReportsList from '@/components/dashboard/BugReportsList';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { fetchBugReports } from '@/services/BugService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [repoFilter, setRepoFilter] = useState<string>('all');

  const { data: bugReports, isLoading, error } = useQuery({
    queryKey: ['bugReports'],
    queryFn: fetchBugReports
  });

  const handleApplyFix = (bug: BugReport) => {
    navigate(`/code-patch/${bug.id}`);
  };

  const filteredBugs = bugReports?.filter(bug => {
    const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;
    const matchesRepo = repoFilter === 'all' || bug.affectedFile.includes(repoFilter); // Basic repo matching
    return matchesSeverity && matchesRepo;
  });

  const uniqueRepos = Array.from(new Set(bugReports?.map(b => b.affectedFile.split('/')[0]) || []));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 animate-fade-in">
        <div className="space-y-6">
          <DashboardHeader 
            bugCount={filteredBugs?.length || 0} 
            totalCount={bugReports?.length || 0}
            onSeverityChange={setSeverityFilter}
            onRepoChange={setRepoFilter}
            repos={uniqueRepos}
          />

          <BugReportsList 
            bugReports={filteredBugs} 
            isLoading={isLoading} 
            error={error as Error | null}
            onApplyFix={handleApplyFix}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
