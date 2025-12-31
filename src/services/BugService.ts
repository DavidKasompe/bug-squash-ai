import api from "@/lib/api";
import { BugReport } from '@/types/bugs';

export const fetchBugReports = async (): Promise<BugReport[]> => {
  try {
    const response = await api.get('/bugs/');
    const data = response.data.results || response.data || [];
    
    return data.map((bug: any) => ({
      id: bug.id,
      summary: bug.title,
      affectedFile: bug.file_path || 'unknown',
      affectedFunction: bug.analysis_result?.function_name || 'unknown',
      suggestedFix: bug.analysis_result?.suggested_fix || 'Analysis in progress...',
      confidenceScore: Math.round(bug.confidence_score * 100),
      severity: bug.severity as 'low' | 'medium' | 'high'
    }));
  } catch (error) {
    console.error("Error fetching bug reports:", error);
    return [];
  }
};
