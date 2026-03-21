
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import { toast } from '@/components/ui/use-toast';
import { PatchService, Patch } from '@/services/PatchService';
import { fetchBugReports } from '@/services/BugService';
import { BugReport } from '@/types/bugs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Github, Loader2, Play, Sparkles, X } from 'lucide-react';
import api from '@/lib/api';

const CodePatchPreview = () => {
  const navigate = useNavigate();
  const { bugId } = useParams<{ bugId: string }>();
  const queryClient = useQueryClient();
  
  const [activePatch, setActivePatch] = useState<Patch | null>(null);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Fetch all bugs to allow selection
  const { data: allBugs = [] } = useQuery({
    queryKey: ['bugReports'],
    queryFn: fetchBugReports
  });

  // Fetch the current bug
  const currentBug = allBugs.find(b => b.id === bugId);

  // Fetch patches for this bug
  const { data: patches = [], isLoading: isPatchesLoading, refetch: refetchPatches } = useQuery({
    queryKey: ['patches', bugId],
    queryFn: () => PatchService.getPatches(bugId),
    enabled: !!bugId
  });

  // Mutation for generating a patch
  const generateMutation = useMutation({
    mutationFn: (id: string) => PatchService.generatePatch(id),
    onSuccess: (newPatch) => {
      queryClient.invalidateQueries({ queryKey: ['patches', bugId] });
      setActivePatch(newPatch);
      toast({
        title: "Success",
        description: "AI Patch generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate patch: " + (error as any).message,
        variant: "destructive",
      });
    }
  });

  // Mutation for applying a patch
  const applyMutation = useMutation({
    mutationFn: (id: string) => PatchService.applyPatch(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['patches', bugId] });
      if (data.pr_url) {
        setPrUrl(data.pr_url);
      }
      toast({
        title: "Applied",
        description: data.message || "Patch marked as applied. A PR has been simulated.",
      });
    }
  });

  useEffect(() => {
    if (patches.length > 0 && !activePatch) {
      setActivePatch(patches[0]);
    }
  }, [patches, activePatch]);

  // Mutation for reviewing a patch
  const reviewMutation = useMutation({
    mutationFn: (id: string) => PatchService.reviewPatch(id, 'Approved by AI Review'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patches', bugId] });
      toast({
        title: "Approved",
        description: "Patch marked as reviewed and ready to apply.",
      });
    }
  });

  // Mutation for rejecting a patch
  const rejectMutation = useMutation({
    mutationFn: (id: string) => PatchService.rejectPatch(id, 'Rejected by AI Review'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patches', bugId] });
      toast({
        title: "Rejected",
        description: "Patch marked as rejected.",
      });
    }
  });

  const handleApplyFix = (id: string) => {
    applyMutation.mutate(id);
  };

  const handleReview = (id: string) => {
    reviewMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const handleBugChange = (id: string) => {
    navigate(`/code-patch/${id}`);
    setActivePatch(null);
  };

  const formatCodeForDiff = (original: string, suggested: string) => {
    const originalLines = (original || '').split('\n');
    const suggestedLines = (suggested || '').split('\n');
    
    return {
      originalWithStatus: originalLines.map((line, idx) => ({
        line,
        status: suggestedLines.includes(line) ? 'unchanged' : 'removed',
        lineNumber: idx + 1
      })),
      suggestedWithStatus: suggestedLines.map((line, idx) => ({
        line,
        status: originalLines.includes(line) ? 'unchanged' : 'added',
        lineNumber: idx + 1
      }))
    };
  };
  
  const handleScroll = (sourceRef: React.RefObject<HTMLDivElement>, targetRef: React.RefObject<HTMLDivElement>) => {
    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollTop = sourceRef.current.scrollTop;
      targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
    }
  };

  
  const formattedCode = activePatch 
    ? formatCodeForDiff(activePatch.original_code, activePatch.patched_code)
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 animate-fade-in">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Code Patch Preview</h1>
            </div>
            
            <div className="w-full md:w-auto flex gap-2">
              <Select 
                value={bugId} 
                onValueChange={handleBugChange}
              >
                <SelectTrigger className="w-full md:w-[250px]" aria-label="Select bug">
                  <SelectValue placeholder="Select a bug" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {allBugs.map(bug => (
                    <SelectItem key={bug.id} value={bug.id}>
                      {bug.summary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {patches.length > 1 && (
                <Select 
                  value={activePatch?.id} 
                  onValueChange={(id) => setActivePatch(patches.find(p => p.id === id) || null)}
                >
                  <SelectTrigger className="w-full md:w-[150px]" aria-label="Select patch variant">
                    <SelectValue placeholder="Variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {patches.map((patch, idx) => (
                      <SelectItem key={patch.id} value={patch.id}>
                        Patch v{patches.length - idx}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-card rounded-t-lg px-4 py-4 border border-b-0 border-border gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{activePatch?.original_file_path || currentBug?.affectedFile}</span>
                {activePatch?.status === 'applied' && (
                  <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1 font-bold">
                    <Check className="h-2 w-2" /> APPLIED
                  </span>
                )}
              </div>
              {prUrl && (
                <a 
                  href={prUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary hover:underline flex items-center gap-1"
                >
                  <Github className="h-3 w-3" /> View Simulated PR
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!activePatch && !isPatchesLoading && (
                <Button 
                  onClick={() => generateMutation.mutate(bugId!)} 
                  disabled={generateMutation.isPending}
                  className="bg-primary hover:bg-primary/90 glow-effect text-xs h-8"
                >
                  {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate AI Patch
                </Button>
              )}

              {activePatch?.status === 'generated' && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-green-500/50 text-green-500 hover:bg-green-500/10 h-8"
                    onClick={() => handleReview(activePatch.id)}
                    disabled={reviewMutation.isPending}
                  >
                    {reviewMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                    Approve Fix
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 h-8"
                    onClick={() => handleReject(activePatch.id)}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    Reject
                  </Button>
                </div>
              )}

              {activePatch?.status === 'reviewed' && (
                <Button 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 glow-effect text-white font-bold h-8 flex items-center gap-2"
                  onClick={() => handleApplyFix(activePatch.id)}
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Github className="h-4 w-4" />}
                  Apply to Repository
                </Button>
              )}

              {activePatch?.status === 'applied' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  className="bg-green-500/10 border-green-500/50 text-green-500 h-8 font-bold"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Applied
                </Button>
              )}

              {activePatch?.status === 'rejected' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  className="bg-destructive/10 border-destructive/50 text-destructive h-8 font-bold"
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejected
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {isPatchesLoading ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-card rounded-b-lg border border-border">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">Retrieving patches...</p>
          </div>
        ) : !activePatch ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-card rounded-b-lg border border-dashed border-border p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No patches generated yet</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              Our AI hasn't proposed a fix for this bug yet. Click the button below to generate a smart patch.
            </p>
            <Button 
              onClick={() => generateMutation.mutate(bugId!)} 
              disabled={generateMutation.isPending}
              size="lg"
              className="bg-primary hover:bg-primary/90 glow-effect"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing context...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Smart Fix
                </>
              )}
            </Button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 rounded-b-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          
          <Card className="border border-border overflow-hidden">
            <div className="bg-card px-4 py-2 border-b border-border sticky top-0 z-10">
              <h3 className="text-sm font-medium">Original Code</h3>
            </div>
            <ScrollArea 
              className="h-[600px] relative scroll-premium" 
              ref={leftScrollRef}
              onScroll={() => handleScroll(leftScrollRef, rightScrollRef)}
            >
              <div className="p-4 font-mono text-xs md:text-sm">
                <table className="w-full border-collapse">
                  <tbody>
                    {formattedCode?.originalWithStatus.map((line, idx) => (
                      <tr 
                        key={`orig-${idx}`} 
                        className={`
                          whitespace-pre transition-colors group
                          ${line.status === 'removed' ? 'bg-destructive/10' : 'hover:bg-muted/30'}
                        `}
                      >
                        <td className="text-right pr-4 text-muted-foreground/50 select-none w-8 border-r border-border/50">
                          {line.lineNumber}
                        </td>
                        <td className={`pl-4 ${line.status === 'removed' ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                          {line.line}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </Card>
          
          
          <Card className="border border-border overflow-hidden">
            <div className="bg-card px-4 py-2 border-b border-border sticky top-0 z-10">
              <h3 className="text-sm font-medium">Suggested Fix</h3>
            </div>
            <ScrollArea 
              className="h-[600px] relative scroll-premium" 
              ref={rightScrollRef}
              onScroll={() => handleScroll(rightScrollRef, leftScrollRef)}
            >
              <div className="p-4 font-mono text-xs md:text-sm">
                <table className="w-full border-collapse">
                  <tbody>
                    {formattedCode?.suggestedWithStatus.map((line, idx) => (
                      <tr 
                        key={`sugg-${idx}`} 
                        className={`
                          whitespace-pre transition-colors group
                          ${line.status === 'added' ? 'bg-accent/10 border-l-2 border-accent' : 'hover:bg-muted/30'}
                        `}
                      >
                        <td className="text-right pr-4 text-muted-foreground/50 select-none w-8 border-r border-border/50">
                          {line.lineNumber}
                        </td>
                        <td className={`pl-4 ${line.status === 'added' ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>
                          {line.line || " "}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </Card>
        </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CodePatchPreview;
