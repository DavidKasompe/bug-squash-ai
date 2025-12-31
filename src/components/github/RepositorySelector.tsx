
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GitHubRepository } from "@/services/GitHubService";
import { GitBranch, Plus } from "lucide-react";

interface RepositorySelectorProps {
  repositories: GitHubRepository[];
  selectedRepo: string | null;
  onChange: (repoId: string) => void;
  disabled: boolean;
  onConnectRepo?: (repoId: number) => void;
  availableRepos?: Array<{
    id: number;
    name: string;
    full_name: string;
    private?: boolean;
    permissions?: {
      admin: boolean;
      push: boolean;
      pull: boolean;
    };
  }>;
}

const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  repositories,
  selectedRepo,
  onChange,
  disabled,
  onConnectRepo,
  availableRepos = []
}) => {
  const [connectingId, setConnectingId] = React.useState<number | null>(null);
  const availableReposRef = React.useRef<HTMLDivElement>(null);

  const handleConnectRepository = async (repoId: number) => {
    setConnectingId(repoId);
    try {
      if (onConnectRepo) {
        await onConnectRepo(repoId);
      }
    } finally {
      setConnectingId(null);
    }
  };

  const scrollToAvailable = () => {
    availableReposRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Connected Repositories</label>
        {availableRepos.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToAvailable}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Connect Repository
          </Button>
        )}
      </div>

      <Select
        value={selectedRepo || ""}
        onValueChange={onChange}
        disabled={disabled || repositories.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a connected repository" />
        </SelectTrigger>
        <SelectContent>
          {repositories.map((repo) => (
            <SelectItem key={repo.id} value={repo.id}>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{repo.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {repo.status} • {repo.default_branch}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {availableRepos.length > 0 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2" ref={availableReposRef}>
          <label className="text-sm font-medium text-foreground">Available Repositories</label>
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {availableRepos.map((repo) => (
              <div key={repo.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{repo.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {repo.full_name} {repo.private && "(Private)"}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectRepository(repo.id)}
                  disabled={connectingId === repo.id || (!repo.permissions?.admin && !repo.permissions?.push)}
                >
                  {connectingId === repo.id ? "Connecting..." : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositorySelector;
