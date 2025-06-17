
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BugReport } from '@/types/bugs';
import { toast } from '@/hooks/use-toast';

interface BugConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  bug: BugReport | null;
}

const BugConfirmModal = ({ isOpen, onClose, bug }: BugConfirmModalProps) => {
  const handleApply = () => {
    
    console.log('Applying fix for bug:', bug?.id);
    
    
    toast({
      title: "Fix applied",
      description: `Successfully applied fix for "${bug?.summary}"`,
      duration: 3000,
    });
    
    onClose();
  };

  if (!bug) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Fix Application</DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to apply the suggested fix for this issue?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-3">
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Bug</h4>
            <p className="text-sm text-muted-foreground">{bug.summary}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Affected Location</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <code className="px-1.5 py-0.5 rounded bg-secondary/50 text-xs">
                {bug.affectedFile}
              </code>
              <span>{">"}</span>
              <code className="px-1.5 py-0.5 rounded bg-secondary/50 text-xs">
                {bug.affectedFunction}
              </code>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply}>Apply Fix</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BugConfirmModal;
