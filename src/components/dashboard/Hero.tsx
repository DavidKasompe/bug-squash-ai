import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bug, Zap, Shield } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80" />

      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative container px-4 md:px-6 py-24 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Powered Bug Detection
              </span>
              <br />
              <span className="text-foreground">for Your Applications</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
              Automatically detect, analyze, and fix bugs in your application
              logs using advanced AI technology.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-border bg-secondary/50 text-foreground font-medium transition-all duration-300 hover:bg-secondary/80"
            >
              View Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mt-16">
            {[
              {
                icon: <Bug className="w-6 h-6 text-primary" />,
                title: "Smart Detection",
                description:
                  "Advanced AI algorithms to identify patterns and potential issues in your logs",
              },
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                title: "Real-time Analysis",
                description:
                  "Instant feedback and analysis of your application's health",
              },
              {
                icon: <Shield className="w-6 h-6 text-primary" />,
                title: "Secure & Private",
                description:
                  "Your data is encrypted and processed securely on our platform",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="p-3 rounded-lg bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
