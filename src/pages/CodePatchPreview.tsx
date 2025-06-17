
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';


const mockPatches = [
  {
    id: '1',
    filename: 'auth.py',
    original: `def validate_token(token):
    user = get_user_from_token(token)
    return validate_user_token(user.token)`,
    suggested: `def validate_token(token):
    user = get_user_from_token(token)
    if user and hasattr(user, "token"):
        return validate_user_token(user.token)
    else:
        return unauthorized_response()`
  },
  {
    id: '2',
    filename: 'db_pool.py',
    original: `def get_connection():
    conn = self._get_available_connection()
    self.in_use.add(conn)
    return conn`,
    suggested: `def get_connection():
    with self.lock:
        conn = self._get_available_connection()
        self.in_use.add(conn)
        return conn`
  },
  {
    id: '3',
    filename: 'image_processor.py',
    original: `def resize_image(img):
    result = process_image(img)
    return result`,
    suggested: `def resize_image(img):
    try:
        result = process_image(img)
        return result
    finally:
        img.close()
        gc.collect()`
  },
  {
    id: '4',
    filename: 'api_views.py',
    original: `def create_user(request):
    try:
        user = User.objects.create(**request.data)
        return JsonResponse(user.to_dict())
    except ValidationError as e:
        return JsonResponse({"error": "Invalid data"})`,
    suggested: `def create_user(request):
    try:
        user = User.objects.create(**request.data)
        return JsonResponse(user.to_dict())
    except ValidationError as e:
        return JsonResponse({
            "error": str(e),
            "code": "validation_error"
        }, status=400)`
  },
  {
    id: '5',
    filename: 'user_dao.py',
    original: `def find_by_username(username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    return cursor.fetchone()`,
    suggested: `def find_by_username(username):
    cursor.execute(
        "SELECT * FROM users WHERE username = %s", 
        [username]
    )
    return cursor.fetchone()`
  }
];

const CodePatchPreview = () => {
  const navigate = useNavigate();
  const { bugId } = useParams();
  const [selectedPatchId, setSelectedPatchId] = useState(bugId || '1');
  const [activePatch, setActivePatch] = useState(mockPatches[0]);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    const patch = mockPatches.find(p => p.id === selectedPatchId) || mockPatches[0];
    setActivePatch(patch);
  }, [selectedPatchId]);

  
  const handleScroll = (sourceRef: React.RefObject<HTMLDivElement>, targetRef: React.RefObject<HTMLDivElement>) => {
    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollTop = sourceRef.current.scrollTop;
      targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
    }
  };

  
  const formatCodeForDiff = (original: string, suggested: string) => {
    const originalLines = original.split('\n');
    const suggestedLines = suggested.split('\n');
    
    
    const result = {
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
    
    return result;
  };

  const formattedCode = formatCodeForDiff(activePatch.original, activePatch.suggested);

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
            
            <div className="w-full md:w-auto">
              <Select 
                value={selectedPatchId} 
                onValueChange={setSelectedPatchId}
              >
                <SelectTrigger className="w-full md:w-[200px]" aria-label="Select file">
                  <SelectValue placeholder="Select file" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {mockPatches.map(patch => (
                    <SelectItem key={patch.id} value={patch.id}>
                      {patch.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-card rounded-t-lg px-4 py-2 border-b border-border">
            <div className="text-sm font-medium text-foreground">{activePatch.filename}</div>
            <div className="text-xs text-muted-foreground">Showing proposed patch</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 rounded-b-lg overflow-hidden">
          
          <Card className="border border-border overflow-hidden">
            <div className="bg-card px-4 py-2 border-b border-border sticky top-0 z-10">
              <h3 className="text-sm font-medium">Original Code</h3>
            </div>
            <ScrollArea 
              className="h-[600px] relative" 
              ref={leftScrollRef}
              onScroll={() => handleScroll(leftScrollRef, rightScrollRef)}
            >
              <div className="p-4 font-mono text-sm">
                <table className="w-full border-collapse">
                  <tbody>
                    {formattedCode.originalWithStatus.map((line, idx) => (
                      <tr 
                        key={`orig-${idx}`} 
                        className={`
                          whitespace-pre transition-colors
                          ${line.status === 'removed' ? 'bg-destructive/20' : 'bg-transparent'}
                        `}
                      >
                        <td className="text-right pr-4 text-muted-foreground select-none w-8">
                          {line.lineNumber}
                        </td>
                        <td className={`pl-4 ${line.status === 'removed' ? 'text-destructive' : 'text-muted-foreground'}`}>
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
              className="h-[600px] relative" 
              ref={rightScrollRef}
              onScroll={() => handleScroll(rightScrollRef, leftScrollRef)}
            >
              <div className="p-4 font-mono text-sm">
                <table className="w-full border-collapse">
                  <tbody>
                    {formattedCode.suggestedWithStatus.map((line, idx) => (
                      <tr 
                        key={`sugg-${idx}`} 
                        className={`
                          whitespace-pre transition-colors
                          ${line.status === 'added' ? 'bg-accent/20' : 'bg-transparent'}
                        `}
                      >
                        <td className="text-right pr-4 text-muted-foreground select-none w-8">
                          {line.lineNumber}
                        </td>
                        <td className={`pl-4 ${line.status === 'added' ? 'text-accent' : 'text-muted-foreground'}`}>
                          {line.line}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CodePatchPreview;
