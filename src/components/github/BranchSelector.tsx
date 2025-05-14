
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitHubBranch } from "@/services/GitHubService";

interface BranchSelectorProps {
  branches: GitHubBranch[];
  selectedBranch: string | null;
  onChange: (branchName: string) => void;
  disabled: boolean;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranch,
  onChange,
  disabled
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Select Branch</label>
      <Select
        value={selectedBranch || ""}
        onValueChange={onChange}
        disabled={disabled || branches.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a branch" />
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch.name} value={branch.name}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BranchSelector;
