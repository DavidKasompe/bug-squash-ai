
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ValidationSummary from '@/components/validation/ValidationSummary';
import TestCaseList from '@/components/validation/TestCaseList';
import { fetchValidationResults } from '@/services/ValidationService';

const ValidationResults = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['validationResults'],
    queryFn: fetchValidationResults
  });
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <Toaster />
      
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Validation Results</h1>
        
        <div className="space-y-8">
          <ValidationSummary 
            totalTests={data?.testCases.length || 0}
            passedCount={data?.passedCount || 0}
            failedCount={data?.failedCount || 0}
            isLoading={isLoading}
          />
          
          <TestCaseList 
            testCases={data?.testCases || []} 
            isLoading={isLoading}
            error={error as Error | null}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ValidationResults;
