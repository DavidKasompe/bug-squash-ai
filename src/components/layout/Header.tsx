import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "../theme-toggle";
import { cn } from "@/lib/utils";
import { Menu, X, Droplet } from "lucide-react";


const BugSquashLogo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="28" height="28" rx="9" fill="url(#bug-gradient)" />
    <g>
      <path
        d="M14 8v2M14 18v2M10 10l-1.5-1.5M18 10l1.5-1.5M10 18l-1.5 1.5M18 18l1.5 1.5M8 14h2M18 14h2"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="14"
        cy="14"
        r="4"
        fill="#fff"
        fillOpacity="0.9"
        stroke="#fff"
        strokeWidth="1.2"
      />
      <circle cx="14" cy="14" r="2" fill="url(#bug-gradient)" />
    </g>
    <defs>
      <linearGradient
        id="bug-gradient"
        x1="0"
        y1="0"
        x2="28"
        y2="28"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2563eb" />
        <stop offset="1" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
  </svg>
);

const ACCENT_COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a21caf" },
  { name: "Orange", value: "#f59e42" },
];

function setAccentColor(color: string) {
  document.documentElement.style.setProperty("--accent-color", color);
  localStorage.setItem("bugsquash-accent", color);
}

function getAccentColor() {
  return localStorage.getItem("bugsquash-accent") || "#2563eb";
}

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const focusableSelectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    const focusableEls = menu.querySelectorAll<HTMLElement>(
      focusableSelectors.join(", ")
    );
    if (focusableEls.length) focusableEls[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        return;
      }
      if (e.key !== "Tab" || focusableEls.length === 0) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    menu.addEventListener("keydown", handleKeyDown);
    return () => menu.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setAccentColor(getAccentColor());
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/upload", label: "Upload Logs" },
    { path: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-40 transition-shadow shadow-none hover:shadow-lg focus-within:shadow-lg">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link
          to="/"
          className="flex items-center gap-3 group select-none"
          aria-label="BugSquash.AI Home"
        >
          <span className="w-10 h-10 flex items-center justify-center">
            <BugSquashLogo />
          </span>
          <span className="font-bold text-xl text-primary dark:bg-gradient-to-r dark:from-primary dark:via-primary/80 dark:to-accent dark:bg-clip-text dark:text-transparent dark:animate-gradient">
            BugSquash.AI
          </span>
        </Link>

        
        <nav
          className="hidden md:flex gap-6"
          role="navigation"
          aria-label="Main navigation"
        >
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "text-sm font-medium transition-colors relative",
                isActive(path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
              aria-current={isActive(path) ? "page" : undefined}
            >
              {label}
              {isActive(path) && (
                <span className="absolute -bottom-[1.5px] left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/signin"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Sign Up
            </Link>
          </div>

          
          <div className="hidden md:flex items-center ml-2">
            <div
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg select-none"
              tabIndex={0}
              aria-label="User profile placeholder"
              role="button"
            >
              U
            </div>
          </div>

          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-secondary/80 transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm animate-slide-down-fade"
          role="menu"
          aria-label="Mobile navigation"
        >
          <div className="container px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-4">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors min-h-[44px] flex items-center px-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive(path)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                  aria-current={isActive(path) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
              <Link
                to="/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2 min-h-[44px] rounded-md text-sm font-medium text-center transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2 min-h-[44px] rounded-md bg-primary text-primary-foreground text-sm font-medium text-center transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
