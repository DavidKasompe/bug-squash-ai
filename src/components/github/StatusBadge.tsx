
import React from "react";
import { Badge } from "@/components/ui/badge";
import { GitHubStatus } from "@/services/GitHubService";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: GitHubStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Badge
      variant={status.connected ? "default" : "outline"}
      className={cn(
        "transition-all",
        status.connected 
          ? "bg-accent text-accent-foreground" 
          : "bg-secondary text-secondary-foreground"
      )}
    >
      {status.connected ? (
        <>GitHub Connected ✅</>
      ) : (
        <>GitHub Not Connected ❌</>
      )}
    </Badge>
  );
};

export default StatusBadge;
