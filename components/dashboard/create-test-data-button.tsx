'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';

interface CreateTestDataButtonProps {
  agentId: Id<"agents">;
}

export default function CreateTestDataButton({ agentId }: CreateTestDataButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);

  const createListing = useMutation(api.setup.createTestListing);
  const createBuyerSession = useMutation(api.setup.createTestBuyerSession);
  const createSellerSession = useMutation(api.setup.createTestSellerSession);

  const handleCreateTestData = async () => {
    setIsLoading(true);

    try {
      // Create listing
      const listingResult = await createListing({ agentId });
      
      // Create buyer session
      const buyerResult = await createBuyerSession({
        agentId,
        buyerName: "John Smith",
        buyerEmail: "john.smith@example.com",
      });
      
      // Create seller session
      const sellerResult = await createSellerSession({
        agentId,
        listingId: listingResult.listingId,
        sellerName: "Jane Doe",
        sellerEmail: "jane.doe@example.com",
      });

      if (!buyerResult.session || !sellerResult.session) {
        throw new Error("Failed to create sessions");
      }

      setTestData({
        buyerSessionCode: buyerResult.session.sessionCode,
        sellerSessionCode: sellerResult.session.sessionCode,
        buyerUrl: buyerResult.buyerUrl,
        sellerUrl: sellerResult.sellerUrl,
      });

      toast.success('Test data created successfully!');
    } catch (error: any) {
      console.error('Error creating test data:', error);
      toast.error(error.message || 'Failed to create test data');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = (url: string, type: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success(`${type} link copied!`);
  };

  if (testData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-500" />
            Test Data Created!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Demo data has been created. Use these links to test the portals:
          </p>

          <div className="space-y-3">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Buyer Portal</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyLink(testData.buyerUrl, 'Buyer')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Link href={testData.buyerUrl} target="_blank">
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {testData.buyerSessionCode}
              </code>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Seller Portal</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyLink(testData.sellerUrl, 'Seller')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Link href={testData.sellerUrl} target="_blank">
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {testData.sellerSessionCode}
              </code>
            </div>
          </div>

          <Button 
            onClick={() => setTestData(null)} 
            variant="outline" 
            className="w-full"
          >
            Create More Test Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Quick Demo Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create test data to explore all features instantly. This will create:
        </p>
        
        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
          <li>1 sample property listing</li>
          <li>1 buyer session with preferences</li>
          <li>1 seller session with analytics</li>
        </ul>

        <Button 
          onClick={handleCreateTestData}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Test Data...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Test Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
