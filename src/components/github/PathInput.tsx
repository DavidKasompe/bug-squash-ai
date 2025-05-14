
import React from "react";
import { Input } from "@/components/ui/input";

interface PathInputProps {
  path: string;
  onPathChange: (path: string) => void;
  disabled: boolean;
}

const PathInput: React.FC<PathInputProps> = ({ path, onPathChange, disabled }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Project Path (Optional)
      </label>
      <Input
        type="text"
        value={path}
        onChange={(e) => onPathChange(e.target.value)}
        placeholder="/ (root directory)"
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        Specify a subdirectory to analyze, or leave empty for the root directory
      </p>
    </div>
  );
};

export default PathInput;
