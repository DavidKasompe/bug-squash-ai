
export interface BugReport {
  id: string;
  summary: string;
  affectedFile: string;
  affectedFunction: string;
  suggestedFix: string;
  confidenceScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CodePatch {
  id: string;
  bugId: string;
  filename: string;
  original: string;
  suggested: string;
}
