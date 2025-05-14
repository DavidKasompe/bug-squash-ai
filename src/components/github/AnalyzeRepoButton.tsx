
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface AnalyzeRepoButtonProps {
  onClick: () => Promise<void>;
  disabled: boolean;
  loading: boolean;
}

const AnalyzeRepoButton: React.FC<AnalyzeRepoButtonProps> = ({
  onClick,
  disabled,
  loading
}) => {
  return (
    <Button
      onClick={onClick}
      className="bg-accent hover:bg-accent/90 font-medium glow-effect w-full mt-4"
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Analyzing Repository...
        </>
      ) : (
        "Analyze This Repository"
      )}
    </Button>
  );
};

export default AnalyzeRepoButton;
