import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubService, GitHubStatus, GitHubRepo, GitHubBranch } from "@/services/GitHubService";
import StatusBadge from "@/components/github/StatusBadge";
import GitHubConnectButton from "@/components/github/GitHubConnectButton";
import RepositorySelector from "@/components/github/RepositorySelector";
import BranchSelector from "@/components/github/BranchSelector";
import PathInput from "@/components/github/PathInput";
import AnalyzeRepoButton from "@/components/github/AnalyzeRepoButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";

const ConnectGitHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [path, setPath] = useState<string>("/");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);


  const {
    data: status = { connected: false },
    isLoading: isStatusLoading,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['githubStatus'],
    queryFn: GitHubService.getStatus,
  });


  const {
    data: repositories = [],
    isLoading: isReposLoading,
    refetch: refetchRepos
  } = useQuery({
    queryKey: ['availableRepos'],
    queryFn: GitHubService.getRepositories,
    enabled: status.connected,
  });

  const {
    data: connectedRepositories = [],
    isLoading: isConnectedReposLoading,
    refetch: refetchConnectedRepos
  } = useQuery({
    queryKey: ['connectedRepos'],
    queryFn: GitHubService.getConnectedRepositories,
    enabled: status.connected,
  });


  const {
    data: branches = [],
    isLoading: isBranchesLoading,
    refetch: refetchBranches
  } = useQuery({
    queryKey: ['githubBranches', selectedRepo],
    queryFn: () => GitHubService.getBranches(selectedRepo as string),
    enabled: !!selectedRepo,
  });


  useEffect(() => {
    setSelectedBranch(null);
  }, [selectedRepo]);


  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      const defaultBranch = branches.find(b => b.name === 'main') || branches[0];
      setSelectedBranch(defaultBranch.name);
    }
  }, [branches, selectedBranch]);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      // Handle the OAuth callback
      GitHubService.handleOAuthCallback(code, state || undefined)
        .then(() => {
          // Navigating to the same page without query params clears the URL and 
          // prevents re-triggering the effect in a loop
          navigate('/connect-github', { replace: true });
          refetchStatus();
          refetchRepos();
          refetchConnectedRepos();
        })
        .catch((error) => {
          console.error('OAuth callback error:', error);
          // Still clear params to avoid re-triggering on reload
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, [searchParams, refetchStatus, refetchRepos]);

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      await GitHubService.connectToGitHub();
      await refetchStatus();
      await refetchRepos();
      await refetchConnectedRepos();
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleAnalyzeRepo = async () => {
    if (!selectedRepo || !selectedBranch) return;

    setIsAnalyzing(true);
    try {
      // Use the new API that accepts repository ID, branches, and paths
      const success = await GitHubService.analyzeRepository(
        selectedRepo, // This should be the repository ID from our connected repos
        selectedBranch ? [selectedBranch] : undefined,
        path !== "/" ? [path] : undefined
      );

      if (success) {
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleConnectRepository = async (repoId: number) => {
    try {
      await GitHubService.connectRepository(repoId);
      // Refresh the connected repositories list
      await Promise.all([refetchConnectedRepos(), refetchRepos()]);
    } catch (error) {
      console.error('Error connecting repository:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the repository. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isStatusLoading || isReposLoading || isConnectedReposLoading || isBranchesLoading;

  const availableReposList = repositories.filter(repo => 
    !connectedRepositories.some(cr => cr.github_id === repo.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl py-12 px-4 md:px-6">
        <div className="animate-fade-in">
          <Card className="border border-border shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">Connect GitHub</CardTitle>
                  <CardDescription className="mt-2">
                    Analyze code or logs directly from your GitHub repositories using AI.
                  </CardDescription>
                </div>
                <StatusBadge status={status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center md:justify-start">
                <GitHubConnectButton 
                  status={status} 
                  onConnect={handleConnectGitHub} 
                  loading={isConnecting}
                />
              </div>

              {status.connected && (
                <div className="space-y-6 animate-fade-in">
                  <RepositorySelector
                    repositories={connectedRepositories}
                    availableRepos={availableReposList}
                    selectedRepo={selectedRepo}
                    onChange={setSelectedRepo}
                    disabled={isLoading || isAnalyzing}
                    onConnectRepo={handleConnectRepository}
                  />

                  {selectedRepo && (
                    <div className="space-y-6 animate-fade-in">
                      <BranchSelector
                        branches={branches}
                        selectedBranch={selectedBranch}
                        onChange={setSelectedBranch}
                        disabled={isBranchesLoading || isAnalyzing}
                      />
                      
                      <PathInput
                        path={path}
                        onPathChange={setPath}
                        disabled={isAnalyzing}
                      />
                      
                      <AnalyzeRepoButton 
                        onClick={handleAnalyzeRepo}
                        disabled={!selectedRepo || !selectedBranch}
                        loading={isAnalyzing}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConnectGitHub;
