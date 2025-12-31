import api from "@/lib/api";

export interface Log {
  id: string;
  file: string | null;
  original_filename: string;
  content: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'failed';
  repository: string | null;
  created_at: string;
  updated_at: string;
  analyzed_at: string | null;
  error_message: string;
}

export const LogService = {
  async uploadLog(file?: File, content?: string, repositoryId?: string): Promise<Log> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (content) {
      formData.append('content', content);
    }
    if (repositoryId) {
      formData.append('repository', repositoryId);
    }

    const response = await api.post('/logs/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async fetchLogs(): Promise<Log[]> {
    const response = await api.get('/logs/');
    return response.data.results || response.data || [];
  },

  async fetchLogStatus(id: string): Promise<Log> {
    const response = await api.get(`/logs/${id}/`);
    return response.data;
  },

  async retryAnalysis(id: string): Promise<Log> {
    const response = await api.post(`/logs/${id}/retry_analysis/`);
    return response.data;
  }
};
