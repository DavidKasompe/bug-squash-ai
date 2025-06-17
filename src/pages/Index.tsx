import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        
        <section className="py-20 px-4 md:px-6 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05)_0,transparent_70%)]"></div>
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Automated Bug Detection & Fixing with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  AI
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                BugSquash.AI automatically detects, analyzes, and suggests fixes
                for bugs in your code using advanced AI models. Save hours of
                debugging time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/upload">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground font-semibold px-8 shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none gap-2"
                  >
                    <Upload className="w-5 h-5 mr-1" />
                    Upload Logs
                  </Button>
                </Link>
                <Link to="/connect-github">
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-medium animated-border"
                  >
                    Connect GitHub
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-16 rounded-lg border border-border bg-card/50 p-1 shadow-lg">
              <div className="relative rounded-md bg-secondary/30 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-8 bg-background flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                </div>
                <div className="pt-8 p-6 font-mono text-sm text-muted-foreground">
                  <pre className="whitespace-pre-wrap">
                    <span className="text-primary">&gt;</span> Analyzing
                    application logs...{"\n"}
                    <span className="text-yellow-500">WARN</span> Memory leak
                    detected in userAuthentication.js{"\n"}
                    <span className="text-destructive">ERROR</span> Uncaught
                    TypeError: Cannot read property 'id' of undefined{"\n"}
                    <span className="text-primary">&gt;</span> Generating fix...
                    {"\n"}
                    <span className="text-accent">SOLUTION</span> Update line
                    42: Check if user object exists before accessing id property
                    {"\n"}
                    <span className="text-primary">&gt;</span> Apply fix? [Y/N]
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-16 px-4 md:px-6 bg-background/40">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                How BugSquash.AI Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform streamlines your debugging workflow with
                advanced analysis and automated fixes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6 text-primary"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">1. Upload</h3>
                <p className="text-muted-foreground text-sm">
                  Simply upload your application logs or error traces through
                  our user-friendly interface.
                </p>
              </div>

              
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">2. Analyze</h3>
                <p className="text-muted-foreground text-sm">
                  Our AI engine analyzes your logs to identify bugs, their root
                  causes, and potential impacts.
                </p>
              </div>

             
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6 text-primary"
                  >
                    <path d="m16 6 4 14" />
                    <path d="M12 6v14" />
                    <path d="M8 8v12" />
                    <path d="M4 4v16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">3. Fix</h3>
                <p className="text-muted-foreground text-sm">
                  Review AI-generated fix suggestions with confidence scores and
                  apply them to your codebase.
                </p>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-20 px-4 md:px-6 relative">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0,transparent_70%)]"></div>
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to squash those bugs?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Upload your logs or connect your GitHub repository to get
                  AI-powered bug analysis and fixes within seconds.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/upload">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground font-semibold px-8 shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none gap-2"
                    >
                      <Upload className="w-5 h-5 mr-1" />
                      Upload Logs
                    </Button>
                  </Link>
                  <Link to="/connect-github">
                    <Button
                      size="lg"
                      variant="outline"
                      className="font-medium animated-border"
                    >
                      Connect GitHub
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
