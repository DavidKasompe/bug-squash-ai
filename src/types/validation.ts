
export interface TestCase {
  id: string;
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  details?: string;
}

export interface ValidationResults {
  testCases: TestCase[];
  passedCount: number;
  failedCount: number;
  successRate: number;
}
