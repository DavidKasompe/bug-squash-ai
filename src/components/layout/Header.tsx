import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Droplet, Github } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";
import { GitHubService } from "@/services/GitHubService";
import { ThemeToggle } from "../theme-toggle";
import { cn } from "@/lib/utils";

const AizoraLogo = () => (
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
  localStorage.setItem("aizora-accent", color);
}

function getAccentColor() {
  return localStorage.getItem("aizora-accent") || "#2563eb";
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout, isLoggedIn } = useUserStore();

  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const menu = mobileMenuRef.current;
      const focusable = menu.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      function handleKeyDown(e: KeyboardEvent) {
        if (e.key !== "Tab") return;

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
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setAccentColor(getAccentColor());
  }, []);

  const { data: githubStatus } = useQuery({
    queryKey: ['githubStatus'],
    queryFn: GitHubService.getStatus,
    enabled: isLoggedIn,
  });

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
          aria-label="Aizora Home"
        >
          <span className="w-10 h-10 flex items-center justify-center">
            <AizoraLogo />
          </span>
          <span className="font-bold text-xl text-primary dark:bg-gradient-to-r dark:from-primary dark:via-primary/80 dark:to-accent dark:bg-clip-text dark:text-transparent dark:animate-gradient">
            Aizora
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
          {isLoggedIn && (
            <Link
              to="/connect-github"
              className={cn(
                "p-2 rounded-md transition-colors relative group",
                githubStatus?.connected 
                  ? "text-primary hover:bg-primary/10" 
                  : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/80"
              )}
              title={githubStatus?.connected ? `Connected as ${githubStatus.username}` : "Connect GitHub"}
              aria-label="GitHub Connection"
            >
              <Github className="w-5 h-5" />
              {githubStatus?.connected && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-secondary/80"
              >
                Logout
              </button>
              <div className="hidden md:flex items-center ml-2">
                <div
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg select-none"
                  tabIndex={0}
                  aria-label="User profile"
                  role="button"
                >
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
            </>
          ) : (
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
          )}
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
                  {isActive(path) && (
                    <span className="absolute -bottom-[1.5px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full text-left px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-2 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
export default Header;
