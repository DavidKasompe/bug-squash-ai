
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [path, setPath] = useState<string>("/");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // Fetch GitHub connection status
  const { 
    data: status = { connected: false },
    isLoading: isStatusLoading,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['githubStatus'],
    queryFn: GitHubService.getStatus,
  });
  
  // Fetch repositories when connected
  const { 
    data: repositories = [], 
    isLoading: isReposLoading,
    refetch: refetchRepos
  } = useQuery({
    queryKey: ['githubRepos'],
    queryFn: GitHubService.getRepositories,
    enabled: status.connected,
  });
  
  // Fetch branches when a repository is selected
  const { 
    data: branches = [],
    isLoading: isBranchesLoading,
    refetch: refetchBranches
  } = useQuery({
    queryKey: ['githubBranches', selectedRepo],
    queryFn: () => GitHubService.getBranches(selectedRepo as string),
    enabled: !!selectedRepo,
  });
  
  // Reset selected branch when repository changes
  useEffect(() => {
    setSelectedBranch(null);
  }, [selectedRepo]);
  
  // Default to the default branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      const defaultBranch = branches.find(b => b.name === 'main') || branches[0];
      setSelectedBranch(defaultBranch.name);
    }
  }, [branches, selectedBranch]);
  
  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      await GitHubService.connectToGitHub();
      await refetchStatus();
      await refetchRepos();
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleAnalyzeRepo = async () => {
    if (!selectedRepo || !selectedBranch) return;
    
    setIsAnalyzing(true);
    try {
      const success = await GitHubService.analyzeRepository(
        selectedRepo,
        selectedBranch,
        path
      );
      
      if (success) {
        // Navigate to dashboard after successful analysis
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const isLoading = isStatusLoading || isReposLoading || isBranchesLoading;

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
                    repositories={repositories}
                    selectedRepo={selectedRepo}
                    onChange={setSelectedRepo}
                    disabled={isLoading || isAnalyzing}
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
