
import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 py-6 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">B</span>
            </div>
            <span className="text-sm font-medium">BugSquash.AI</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Automatically detect, analyze, and fix code bugs with AI
          </div>
          
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BugSquash.AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
