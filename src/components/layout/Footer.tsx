import React from "react";
import { Link } from "react-router-dom";
import { Github, BookOpen, Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 py-6 px-4 md:px-0">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <a
            href="/docs"
            className="hover:text-primary flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpen className="w-4 h-4" /> Docs
          </a>
          <a
            href="https://github.com/your-org/aizora"
            className="hover:text-primary flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
          <a
            href="/privacy"
            className="hover:text-primary flex items-center gap-1"
          >
            <Shield className="w-4 h-4" /> Privacy Policy
          </a>
        </nav>
      </div>
      <div className="container mx-auto mt-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Aizora. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
