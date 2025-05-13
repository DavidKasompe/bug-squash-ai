
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bug, Circle, Circle2, Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BugReport } from '@/types/bugs';
import BugConfirmModal from '@/components/dashboard/BugConfirmModal';
import { Skeleton } from '@/components/ui/skeleton';

// Mock fetch function to simulate API call to Django backend
const fetchBugReports = async (): Promise<BugReport[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // This would be an actual API call to your Django backend
  return [
    {
      id: '1',
      summary: 'NullPointerException in authentication middleware',
      affectedFile: 'auth.py',
      affectedFunction: 'validate_token',
      suggestedFix: 'Add null check before accessing user.token property:\n\nif user and hasattr(user, "token"):\n    validate_token(user.token)\nelse:\n    return unauthorized_response()',
      confidenceScore: 92,
      severity: 'high'
    },
    {
      id: '2',
      summary: 'Race condition in database connection pool',
      affectedFile: 'db_pool.py',
      affectedFunction: 'get_connection',
      suggestedFix: 'Add mutex lock around connection acquisition:\n\nwith self.lock:\n    conn = self._get_available_connection()\n    self.in_use.add(conn)\n    return conn',
      confidenceScore: 78,
      severity: 'medium'
    },
    {
      id: '3',
      summary: 'Memory leak in image processing module',
      affectedFile: 'image_processor.py',
      affectedFunction: 'resize_image',
      suggestedFix: 'Ensure resources are properly freed:\n\ntry:\n    result = process_image(img)\n    return result\nfinally:\n    img.close()\n    gc.collect()',
      confidenceScore: 65,
      severity: 'medium'
    },
    {
      id: '4',
      summary: 'Incorrect error handling in API endpoint',
      affectedFile: 'api_views.py',
      affectedFunction: 'create_user',
      suggestedFix: 'Return proper status code and error message:\n\nexcept ValidationError as e:\n    return JsonResponse({\n        "error": str(e),\n        "code": "validation_error"\n    }, status=400)',
      confidenceScore: 88,
      severity: 'high'
    },
    {
      id: '5',
      summary: 'Improper SQL query construction leading to injection risk',
      affectedFile: 'user_dao.py',
      affectedFunction: 'find_by_username',
      suggestedFix: 'Use parameterized queries:\n\ncursor.execute(\n    "SELECT * FROM users WHERE username = %s", \n    [username]\n)',
      confidenceScore: 96,
      severity: 'high'
    }
  ];
};

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

  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 85) return 'default'; // Green for high
    if (score >= 70) return 'secondary'; // Yellow for medium
    return 'destructive'; // Red for low
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return 'High';
    if (score >= 70) return 'Medium';
    return 'Low';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 animate-fade-in">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bug Analysis Dashboard</h1>
              <p className="text-muted-foreground mt-1">Review detected issues and apply AI-suggested fixes</p>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
              <Bug className="h-4 w-4 text-primary" />
              <span className="font-medium">{bugReports?.length || 0} Bugs Detected</span>
            </div>
          </div>

          {isLoading ? (
            <BugReportsSkeleton />
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-destructive mb-2">Failed to load bug reports</p>
              <p className="text-muted-foreground">Please check your connection and try again</p>
            </div>
          ) : bugReports?.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg mb-2">No bugs detected</p>
              <p className="text-muted-foreground">Upload logs to begin analysis</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 animate-fade-in">
              {bugReports?.map((bug) => (
                <Collapsible key={bug.id} className="bug-card group transition-all">
                  <Card className="overflow-hidden border-border hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{bug.summary}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <code className="px-1.5 py-0.5 rounded bg-secondary/50 text-xs">
                              {bug.affectedFile}
                            </code>
                            <span>{">"}</span>
                            <code className="px-1.5 py-0.5 rounded bg-secondary/50 text-xs">
                              {bug.affectedFunction}
                            </code>
                          </div>
                        </div>
                        <Badge variant={getConfidenceBadgeVariant(bug.confidenceScore)}>
                          {getConfidenceLabel(bug.confidenceScore)}
                        </Badge>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Confidence Score</span>
                          <span className="font-medium">{bug.confidenceScore}%</span>
                        </div>
                        <Progress value={bug.confidenceScore} className="h-1.5" />
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3 pt-0">
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 transition-colors w-full justify-start pt-2" aria-label="Show suggested fix">
                        <span>Suggested Fix</span>
                        <Circle2 className="h-3 w-3" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="animate-accordion-down mt-2">
                        <pre className="code-block whitespace-pre-wrap text-xs">
                          {bug.suggestedFix}
                        </pre>
                      </CollapsibleContent>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button 
                        onClick={() => handleApplyFix(bug)} 
                        className="w-full hover:glow-effect"
                        aria-label={`Apply fix for ${bug.summary}`}
                      >
                        Apply Fix
                      </Button>
                    </CardFooter>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
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

const BugReportsSkeleton = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/3 mb-1" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
