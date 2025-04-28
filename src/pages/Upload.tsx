
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FileUpload from '@/components/upload/FileUpload';

const Upload = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 px-4 md:px-6 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3 text-foreground">Upload Logs</h1>
            <p className="text-muted-foreground">
              Upload or paste your log files to begin AI-powered bug detection and analysis.
            </p>
          </div>
          
          <FileUpload />
          
          <div className="mt-16 bg-card border border-border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">i</span>
              </span>
              Supported Formats
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>BugSquash.AI supports the following log formats:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Text logs (.log, .txt)</li>
                <li>JSON logs (.json)</li>
                <li>Application logs (Node.js, Java, Python)</li>
                <li>Error stack traces</li>
              </ul>
              <p className="mt-4">
                For best results, include complete error stacks and contextual information in your logs.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upload;
