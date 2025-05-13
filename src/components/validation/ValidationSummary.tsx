
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ValidationSummaryProps {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  isLoading: boolean;
}

const ValidationSummary = ({ totalTests, passedCount, failedCount, isLoading }: ValidationSummaryProps) => {
  const successRate = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;
  
  if (isLoading) {
    return (
      <Card className="w-full border-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-card rounded-lg">
            <span className="text-sm text-muted-foreground mb-2">Total Tests</span>
            <span className="text-3xl font-bold">{totalTests}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-card rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Passed</span>
            </div>
            <span className="text-3xl font-bold text-green-500">{passedCount}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-card rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <X className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <span className="text-3xl font-bold text-red-500">{failedCount}</span>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full max-w-md">
            <Progress
              value={successRate}
              className="h-3 w-full"
            />
          </div>
          <span className="mt-2 text-xl font-semibold">
            {successRate}% Success
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationSummary;
