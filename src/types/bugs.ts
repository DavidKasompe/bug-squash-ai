
export interface BugReport {
  id: string;
  summary: string;
  affectedFile: string;
  affectedFunction: string;
  suggestedFix: string;
  confidenceScore: number;
  severity: 'low' | 'medium' | 'high';
}
