import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '@/components/layout/Footer';
import FileUpload from '@/components/upload/FileUpload';
import RepositorySelector from '@/components/github/RepositorySelector';
import { useQuery } from '@tanstack/react-query';
import { GitHubService } from '@/services/GitHubService';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

const Upload = () => {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: connectedRepos = [], isLoading: isConnectedLoading, refetch: refetchConnected } = useQuery({
    queryKey: ['connected-repos'],
    queryFn: () => GitHubService.getConnectedRepositories(),
  });

  const { data: availableRepos = [], isLoading: isAvailableLoading, refetch: refetchAvailable } = useQuery({
    queryKey: ['available-repos'],
    queryFn: () => GitHubService.getRepositories(),
  });

  const handleConnectRepo = async (repoId: number) => {
    try {
      await GitHubService.connectRepository(repoId);
      refetchConnected();
      refetchAvailable();
      toast({
        title: "Repository Connected",
        description: "You can now select this repository for log analysis.",
      });
    } catch (error) {
      // Error handled by service
    }
  };

  const isLoading = isConnectedLoading || isAvailableLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Toaster />
      <main className="flex-1 container py-12 px-4 md:px-6 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3 text-foreground">Upload Logs</h1>
            <p className="text-muted-foreground">
              Direct AI-powered analysis of your logs. Link them to a repository for precise bug detection.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
            <RepositorySelector 
              repositories={connectedRepos}
              selectedRepo={selectedRepo}
              onChange={setSelectedRepo}
              disabled={isLoading}
              availableRepos={availableRepos}
              onConnectRepo={handleConnectRepo}
            />
          </div>
          
          <FileUpload repositoryId={selectedRepo || undefined} />
          
          <div className="mt-16 bg-card border border-border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">i</span>
              </span>
              Supported Formats
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Aizora supports the following log formats:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Text logs (.log, .txt)</li>
                <li>JSON logs (.json)</li>
                <li>Application logs (Node.js, Java, Python)</li>
                <li>Error stack traces</li>
              </ul>
              <p className="mt-4">
                For best results, include complete error stacks and contextual information in your logs.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upload;
