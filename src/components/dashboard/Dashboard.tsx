import React from "react";
import { Link } from "react-router-dom";
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BarChart3,
  Activity,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  
  const stats = [
    {
      title: "Total Bugs",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: <Bug className="w-5 h-5" />,
    },
    {
      title: "Critical Issues",
      value: "8",
      change: "-3%",
      trend: "down",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      title: "Resolved",
      value: "16",
      change: "+8%",
      trend: "up",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      title: "Avg. Resolution Time",
      value: "2.5h",
      change: "-15%",
      trend: "down",
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  const recentBugs = [
    {
      id: 1,
      title: "Database Connection Error",
      severity: "critical",
      status: "open",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      title: "API Rate Limit Exceeded",
      severity: "warning",
      status: "resolved",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      title: "Memory Leak Detected",
      severity: "high",
      status: "investigating",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="container px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your application's health and bug status
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Upload New Logs
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-card border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">{stat.icon}</div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  )}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          ))}
        </div>

        
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold">Recent Bugs</h2>
          </div>
          <div className="divide-y divide-border/50">
            {recentBugs.map((bug) => (
              <div
                key={bug.id}
                className="p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1">{bug.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          bug.severity === "critical"
                            ? "bg-red-500/10 text-red-500"
                            : bug.severity === "high"
                            ? "bg-orange-500/10 text-orange-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        )}
                      >
                        {bug.severity}
                      </span>
                      <span>•</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          bug.status === "open"
                            ? "bg-blue-500/10 text-blue-500"
                            : bug.status === "resolved"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-purple-500/10 text-purple-500"
                        )}
                      >
                        {bug.status}
                      </span>
                      <span>•</span>
                      <span>{bug.timestamp}</span>
                    </div>
                  </div>
                  <Link
                    to={`/bugs/${bug.id}`}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "View Analytics",
              description: "Detailed insights and trends",
              icon: <BarChart3 className="w-6 h-6" />,
              href: "/analytics",
            },
            {
              title: "System Health",
              description: "Monitor application status",
              icon: <Activity className="w-6 h-6" />,
              href: "/health",
            },
            {
              title: "Security Scan",
              description: "Check for vulnerabilities",
              icon: <Shield className="w-6 h-6" />,
              href: "/security",
            },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="p-3 rounded-lg bg-primary/10">{action.icon}</div>
              <div>
                <h3 className="font-medium mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
