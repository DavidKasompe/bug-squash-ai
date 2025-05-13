
import { BugReport } from '@/types/bugs';

// Mock fetch function to simulate API call to Django backend
export const fetchBugReports = async (): Promise<BugReport[]> => {
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
