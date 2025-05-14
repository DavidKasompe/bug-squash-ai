
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitHubRepo } from "@/services/GitHubService";

interface RepositorySelectorProps {
  repositories: GitHubRepo[];
  selectedRepo: string | null;
  onChange: (repoName: string) => void;
  disabled: boolean;
}

const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  repositories,
  selectedRepo,
  onChange,
  disabled
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Select Repository</label>
      <Select
        value={selectedRepo || ""}
        onValueChange={onChange}
        disabled={disabled || repositories.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a repository" />
        </SelectTrigger>
        <SelectContent>
          {repositories.map((repo) => (
            <SelectItem key={repo.id} value={repo.name}>
              {repo.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RepositorySelector;
