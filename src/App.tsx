import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Upload from "./pages/Upload";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import CodePatchPreview from "./pages/CodePatchPreview";
import ValidationResults from "./pages/ValidationResults";
import ConnectGitHub from "./pages/ConnectGitHub";

const App = () => {
  
  const queryClient = new QueryClient();

  return (
    <ThemeProvider defaultTheme="system" storageKey="bugsquash-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/code-patch/:bugId?"
                element={<CodePatchPreview />}
              />
              <Route path="/validation" element={<ValidationResults />} />
              <Route path="/connect-github" element={<ConnectGitHub />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
