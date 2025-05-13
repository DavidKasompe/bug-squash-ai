
import React, { useState } from 'react';
import { TestCase } from '@/types/validation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TestCaseListProps {
  testCases: TestCase[];
  isLoading: boolean;
  error: Error | null;
}

const TestCaseList = ({ testCases, isLoading, error }: TestCaseListProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  const filteredTests = testCases.filter(test => {
    if (filter === "all") return true;
    return test.status === filter;
  });

  if (error) {
    return (
      <Card className="border-red-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center p-4">
            <span className="text-red-500">Error loading test results: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Test Cases</CardTitle>
        
        <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value)}>
          <ToggleGroupItem value="all" aria-label="Show all tests">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="passed" aria-label="Show passed tests">
            Passed
          </ToggleGroupItem>
          <ToggleGroupItem value="failed" aria-label="Show failed tests">
            Failed
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <span className="text-muted-foreground">No test cases match the current filter</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <TestCaseItem key={test.id} test={test} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TestCaseItem = ({ test }: { test: TestCase }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "w-full rounded-lg transition-all hover:shadow-md",
        test.status === "passed" 
          ? "bg-green-500/10 hover:bg-green-500/15" 
          : "bg-red-500/10 hover:bg-red-500/15",
        "animate-fade-in"
      )}
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {test.status === "passed" ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">{test.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{test.duration.toFixed(2)}s</span>
            <Badge variant={test.status === "passed" ? "default" : "destructive"}>
              {test.status === "passed" ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </div>
      </CollapsibleTrigger>
      
      {test.details && (
        <CollapsibleContent>
          <Separator className="my-2" />
          <div className="p-4 pt-2 text-sm text-muted-foreground">
            {test.details}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default TestCaseList;
