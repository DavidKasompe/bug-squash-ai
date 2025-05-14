
import React from "react";
import { Button } from "@/components/ui/button";
import { GitHubService, GitHubStatus } from "@/services/GitHubService";
import { Github } from "lucide-react";

interface GitHubConnectButtonProps {
  status: GitHubStatus;
  onConnect: () => Promise<void>;
  loading: boolean;
}

const GitHubConnectButton: React.FC<GitHubConnectButtonProps> = ({ 
  status, 
  onConnect,
  loading
}) => {
  return (
    <Button
      onClick={onConnect}
      className={`glow-effect font-medium ${status.connected ? "bg-secondary" : "bg-primary"}`}
      disabled={loading}
    >
      <Github className="mr-2" />
      {loading ? "Connecting..." : (status.connected ? "Reconnect GitHub" : "Connect GitHub")}
    </Button>
  );
};

export default GitHubConnectButton;
