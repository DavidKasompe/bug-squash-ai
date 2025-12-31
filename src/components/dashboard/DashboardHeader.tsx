import React from 'react';
import { Bug, Filter, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardHeaderProps {
  bugCount: number;
  totalCount: number;
  onSeverityChange: (value: string) => void;
  onRepoChange: (value: string) => void;
  repos: string[];
}

const DashboardHeader = ({ bugCount, totalCount, onSeverityChange, onRepoChange, repos }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Bug Analysis Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg">
          Direct AI-powered analysis of your repository. Review detected issues and apply smart fixes.
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border shadow-sm backdrop-blur-sm">
          <Bug className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm tracking-tight">
            {bugCount} <span className="text-muted-foreground font-normal">/ {totalCount} Bugs</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Select onValueChange={onRepoChange} defaultValue="all">
            <SelectTrigger className="w-[140px] h-9 rounded-xl border-border bg-card/50">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Repo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Repos</SelectItem>
              {repos.map(repo => (
                <SelectItem key={repo} value={repo}>{repo}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={onSeverityChange} defaultValue="all">
            <SelectTrigger className="w-[120px] h-9 rounded-xl border-border bg-card/50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Severity" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
