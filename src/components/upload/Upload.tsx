import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload as UploadIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const uploadedFile = acceptedFiles[0];

      if (!uploadedFile) {
        setError("Please select a file to upload");
        toast({
          title: "No file selected",
          description: "Please select a file to upload.",
          variant: "destructive",
        });
        return;
      }

      if (!uploadedFile.name.endsWith(".log")) {
        setError("Please upload a .log file");
        toast({
          title: "Invalid file type",
          description: "Please upload a .log file.",
          variant: "destructive",
        });
        return;
      }

      setFile(uploadedFile);
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".log"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
      setIsSuccess(true);
      toast({
        title: "Upload successful",
        description: `${file.name} uploaded successfully!`,
      });
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Upload Log Files
          </h1>
          <p className="text-muted-foreground">
            Upload your application logs for AI-powered bug detection and
            analysis
          </p>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 transition-all duration-300",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-primary/5",
            error && "border-destructive"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              <UploadIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive
                  ? "Drop your log file here"
                  : "Drag and drop your log file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
            <FileText className="w-6 h-6 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Remove
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm">File uploaded successfully!</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={cn(
            "w-full py-3 rounded-lg font-medium transition-all duration-300",
            !file || isUploading
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          )}
        >
          {isUploading ? "Uploading..." : "Upload and Analyze"}
        </button>
      </div>
    </div>
  );
};

export default Upload;
