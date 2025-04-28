
import React, { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [logText, setLogText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  }, []);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, []);
  
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setLogText(content);
      toast({
        title: "File loaded",
        description: `Successfully loaded ${file.name}`,
      });
    };
    reader.readAsText(file);
  };
  
  const handleAnalyze = () => {
    if (!logText.trim()) {
      toast({
        title: "Error",
        description: "Please provide log data to analyze",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    // Simulate analysis process
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Analysis Complete",
        description: "Your logs have been analyzed successfully",
      });
      // Here you would typically redirect to results or update state
    }, 2000);
  };
  
  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* File drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer min-h-[300px] ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-background/50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="size-8 text-primary"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="font-medium text-lg mb-1">Drag and drop your log files</h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
          <div className="relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileSelect}
              accept=".log,.txt,.json"
            />
            <button className="px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors text-sm">
              Select File
            </button>
          </div>
        </div>
      </div>

      {/* Text area for direct input */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Or paste your logs directly:</label>
          {logText && (
            <button 
              className="text-xs text-primary hover:text-primary/80 transition-colors"
              onClick={() => setLogText('')}
            >
              Clear
            </button>
          )}
        </div>
        <textarea 
          className="w-full h-48 bg-card border border-border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono text-sm"
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          placeholder="Paste your log content here..."
        />
      </div>

      {/* Analyze button */}
      <button 
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 glow-effect ${
          isUploading 
            ? 'bg-primary/50 cursor-not-allowed' 
            : 'bg-primary hover:bg-primary/90 transition-colors'
        }`}
        onClick={handleAnalyze}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          <>Analyze Logs</>
        )}
      </button>

      {isUploading && (
        <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
          <div className="bg-primary h-1.5 rounded-full animate-pulse-glow" style={{ width: '60%' }}></div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
