
import React from 'react';
import { Bug } from 'lucide-react';

interface DashboardHeaderProps {
  bugCount: number;
}

const DashboardHeader = ({ bugCount }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bug Analysis Dashboard</h1>
        <p className="text-muted-foreground mt-1">Review detected issues and apply AI-suggested fixes</p>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
        <Bug className="h-4 w-4 text-primary" />
        <span className="font-medium">{bugCount} Bugs Detected</span>
      </div>
    </div>
  );
};

export default DashboardHeader;
