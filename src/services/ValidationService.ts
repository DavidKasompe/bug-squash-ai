
import { ValidationResults } from '@/types/validation';

export const fetchValidationResults = async (): Promise<ValidationResults> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock data for validation results
  const testCases = [
    {
      id: '1',
      name: 'Connection to database successful',
      status: 'passed' as const,
      duration: 0.42,
    },
    {
      id: '2',
      name: 'SQL query properly sanitized',
      status: 'passed' as const,
      duration: 0.37,
      details: 'All input parameters were correctly escaped'
    },
    {
      id: '3',
      name: 'Authorization check prevents access',
      status: 'failed' as const,
      duration: 0.53,
      details: 'Token validation failed with error: Unexpected token format'
    },
    {
      id: '4',
      name: 'Response format matches API spec',
      status: 'passed' as const,
      duration: 0.28,
    },
    {
      id: '5',
      name: 'Race condition in connection pool fixed',
      status: 'passed' as const,
      duration: 0.91,
    },
    {
      id: '6',
      name: 'Error handling returns correct status code',
      status: 'failed' as const,
      duration: 0.38,
      details: 'Expected 400 but received 500'
    },
    {
      id: '7',
      name: 'Memory leak resolved in image processing',
      status: 'passed' as const,
      duration: 1.22,
    },
  ];
  
  const passedCount = testCases.filter(test => test.status === 'passed').length;
  
  return {
    testCases,
    passedCount,
    failedCount: testCases.length - passedCount,
    successRate: Math.round((passedCount / testCases.length) * 100)
  };
};
