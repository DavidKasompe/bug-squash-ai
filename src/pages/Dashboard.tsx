
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BugReport } from '@/types/bugs';
import BugConfirmModal from '@/components/dashboard/BugConfirmModal';
import BugReportsList from '@/components/dashboard/BugReportsList';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { fetchBugReports } from '@/services/BugService';

const Dashboard = () => {
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: bugReports, isLoading, error } = useQuery({
    queryKey: ['bugReports'],
    queryFn: fetchBugReports
  });

  const handleApplyFix = (bug: BugReport) => {
    setSelectedBug(bug);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 animate-fade-in">
        <div className="space-y-6">
          <DashboardHeader bugCount={bugReports?.length || 0} />

          <BugReportsList 
            bugReports={bugReports} 
            isLoading={isLoading} 
            error={error as Error | null}
            onApplyFix={handleApplyFix}
          />
        </div>
      </main>

      <Footer />
      <BugConfirmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        bug={selectedBug} 
      />
    </div>
  );
};

export default Dashboard;
