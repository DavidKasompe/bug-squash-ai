
import React, { useState } from 'react';
import { Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BugReport } from '@/types/bugs';

interface BugReportCardProps {
  bug: BugReport;
  onApplyFix: (bug: BugReport) => void;
}

const BugReportCard = ({ bug, onApplyFix }: BugReportCardProps) => {
  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 85) return 'default'; 
    if (score >= 70) return 'secondary'; 
    return 'destructive'; 
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return 'High';
    if (score >= 70) return 'Medium';
    return 'Low';
  };

  return (
    <Collapsible className="bug-card group transition-all">
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
            <Circle className="h-3 w-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down mt-2">
            <pre className="code-block whitespace-pre-wrap text-xs">
              {bug.suggestedFix}
            </pre>
          </CollapsibleContent>
        </CardContent>

        <CardFooter className="pt-0 flex flex-col md:flex-row gap-2">
          <Button 
            onClick={() => onApplyFix(bug)} 
            className="w-full md:flex-1 hover:glow-effect"
            aria-label={`Apply fix for ${bug.summary}`}
          >
            Apply Fix
          </Button>
          <Button 
            variant="outline" 
            className="w-full md:flex-1"
            asChild
          >
            <Link to={`/code-patch/${bug.id}`} aria-label={`View code patch for ${bug.summary}`}>
              View Diff
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </Collapsible>
  );
};

export default BugReportCard;
