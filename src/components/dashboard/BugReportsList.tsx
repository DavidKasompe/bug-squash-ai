
import React from 'react';
import { BugReport } from '@/types/bugs';
import BugReportCard from './BugReportCard';
import BugReportsSkeleton from './BugReportsSkeleton';

interface BugReportsListProps {
  bugReports: BugReport[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onApplyFix: (bug: BugReport) => void;
}

const BugReportsList = ({ 
  bugReports, 
  isLoading, 
  error, 
  onApplyFix 
}: BugReportsListProps) => {
  
  if (isLoading) {
    return <BugReportsSkeleton />;
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-2">Failed to load bug reports</p>
        <p className="text-muted-foreground">Please check your connection and try again</p>
      </div>
    );
  }
  
  if (!bugReports?.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg mb-2">No bugs detected</p>
        <p className="text-muted-foreground">Upload logs to begin analysis</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 animate-fade-in">
      {bugReports.map((bug) => (
        <BugReportCard 
          key={bug.id} 
          bug={bug} 
          onApplyFix={onApplyFix}
        />
      ))}
    </div>
  );
};

export default BugReportsList;
