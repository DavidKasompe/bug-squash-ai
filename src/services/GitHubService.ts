
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  private?: boolean;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected?: boolean;
}

export interface GitHubRepository {
  id: string;
  github_id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  default_branch: string;
  status: 'active' | 'inactive' | 'syncing' | 'error';
  auto_analyze: boolean;
  analyze_branches: string[];
  analyze_paths: string[];
  last_synced_at?: string;
  created_at: string;
}

export interface GitHubStatus {
  connected: boolean;
  username?: string;
  repositories?: GitHubRepository[];
}

export const GitHubService = {
  async getStatus(): Promise<GitHubStatus> {
    try {
      const response = await api.get('/github/integration/status/');
      return {
        connected: response.data.connected,
        username: response.data.username
      };
    } catch (error) {
      console.error("Error fetching GitHub status:", error);
      return { connected: false };
    }
  },

  async connectToGitHub(): Promise<void> {
    try {
      // Initiate OAuth flow by redirecting to GitHub
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || window.location.origin + '/connect-github';

      if (!clientId) {
        throw new Error('GitHub Client ID not configured');
      }

      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,read:user&response_type=code`;

      // Redirect to GitHub OAuth
      window.location.href = githubAuthUrl;
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
      toast({
        title: "Error",
        description: "Failed to connect to GitHub",
        variant: "destructive",
      });
    }
  },

  async handleOAuthCallback(code: string, state?: string): Promise<void> {
    try {
      const response = await api.post('/github/integration/oauth-callback/', { 
        code,
        state: state || new URLSearchParams(window.location.search).get('state') 
      });

      toast({
        title: "Success",
        description: "Connected to GitHub successfully",
      });
      
      return response.data;
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      toast({
        title: "Error",
        description: "Failed to complete GitHub connection",
        variant: "destructive",
      });
      throw error;
    }
  },

  async getRepositories(): Promise<GitHubRepo[]> {
    try {
      const response = await api.get('/github/integration/');
      return response.data.repositories || [];
    } catch (error) {
      console.error("Error fetching repositories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch GitHub repositories",
        variant: "destructive",
      });
      return [];
    }
  },

  async getConnectedRepositories(): Promise<GitHubRepository[]> {
    try {
      const response = await api.get('/github/repositories/');
      // Handling DRF pagination if applicable, otherwise assume records directly
      return response.data.results || response.data || [];
    } catch (error) {
      console.error("Error fetching connected repositories:", error);
      return [];
    }
  },

  async connectRepository(repositoryId: number): Promise<void> {
    try {
      await api.post('/github/integration/', { repository_id: repositoryId });
      toast({
        title: "Success",
        description: "Repository connected successfully",
      });
    } catch (error) {
      console.error("Error connecting repository:", error);
      toast({
        title: "Error",
        description: "Failed to connect repository",
        variant: "destructive",
      });
      throw error;
    }
  },

  async getBranches(repositoryId: string): Promise<GitHubBranch[]> {
    try {
      const response = await api.get(`/github/repositories/${repositoryId}/branches/`);
      return response.data.branches || [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch repository branches",
        variant: "destructive",
      });
      return [];
    }
  },

  async analyzeRepository(
    repositoryId: string,
    branches?: string[],
    paths?: string[]
  ): Promise<{ success: boolean; analysis_id?: string }> {
    try {
      const payload: any = {};
      if (branches && branches.length > 0) payload.branches = branches;
      if (paths && paths.length > 0) payload.paths = paths;

      const response = await api.post(`/github/repositories/${repositoryId}/analyze/`, payload);

      toast({
        title: "Analysis Started",
        description: "Repository analysis has been initiated",
      });

      return {
        success: true,
        analysis_id: response.data.analysis_id
      };
    } catch (error) {
      console.error("Error analyzing repository:", error);
      toast({
        title: "Error",
        description: "Failed to start repository analysis",
        variant: "destructive",
      });
      return { success: false };
    }
  },

  async syncRepository(repositoryId: string): Promise<boolean> {
    try {
      await api.post(`/github/repositories/${repositoryId}/sync/`);
      toast({
        title: "Sync Started",
        description: "Repository sync has been initiated",
      });
      return true;
    } catch (error) {
      console.error("Error syncing repository:", error);
      toast({
        title: "Error",
        description: "Failed to sync repository",
        variant: "destructive",
      });
      return false;
    }
  },
};
