'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface DemoModeButtonProps {
  userId: string;
  userEmail: string;
}

export default function DemoModeButton({ userId, userEmail }: DemoModeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  
  const createDemoData = useMutation(api.demoData.createDemoData);

  const handleGenerateDemo = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const res = await createDemoData({
        externalId: userId,
        email: userEmail,
      });
      
      setResult(res);
      toast({
        title: "Demo Data Created!",
        description: `Generated ${res.stats.listings} listings, ${res.stats.buyerSessions} buyer sessions, and ${res.stats.sellerSessions} seller sessions.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate demo data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Session code copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={handleGenerateDemo}
        disabled={loading}
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Demo Data...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Demo Data
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Check className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  Demo Data Generated Successfully!
                </h3>
              </div>
              
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-muted-foreground">Property Listings</span>
                  <Badge variant="secondary">{result.stats.listings}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-muted-foreground">Buyer Sessions</span>
                  <Badge variant="secondary">{result.stats.buyerSessions}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-muted-foreground">Seller Sessions</span>
                  <Badge variant="secondary">{result.stats.sellerSessions}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {result.buyerSessionCodes && result.buyerSessionCodes.length > 0 && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold mb-3">Buyer Session Links</h3>
                {result.buyerSessionCodes.map((code: string, index: number) => (
                  <div key={code} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Buyer #{index + 1}</div>
                      <div className="text-xs text-muted-foreground font-mono">{code}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/buyer/${code}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.sellerSessionCodes && result.sellerSessionCodes.length > 0 && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold mb-3">Seller Session Links</h3>
                {result.sellerSessionCodes.map((code: string, index: number) => (
                  <div key={code} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Seller #{index + 1}</div>
                      <div className="text-xs text-muted-foreground font-mono">{code}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/seller/${code}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
