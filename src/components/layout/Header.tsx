
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-40">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">B</span>
          </div>
          <span className="font-bold text-lg">BugSquash.AI</span>
        </Link>
        
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/upload" className="text-foreground/80 hover:text-primary transition-colors">
            Upload Logs
          </Link>
          <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors">
            Dashboard
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-md border border-border bg-secondary/50 text-foreground hover:bg-secondary/80 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
