'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Sparkles } from 'lucide-react';

export default function SeedViewsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const generateViews = useMutation(api.seedPropertyViews.generateFakeViews);
  const clearViews = useMutation(api.seedPropertyViews.clearAllViews);

  const handleGenerateViews = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateViews({});
      setResult(res);
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClearViews = async () => {
    if (!confirm('Are you sure you want to delete ALL property views? This cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setResult(null);
    try {
      const res = await clearViews({});
      setResult(res);
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Seed Property Views</h1>
          <p className="text-muted-foreground mt-2">
            Generate fake property views to test AI match scoring system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Fake Views</CardTitle>
            <CardDescription>
              This will create 3-8 property views for each active buyer session, 
              with realistic view durations, image views, and section visits. 
              AI match scores will be calculated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleGenerateViews}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Fake Views
                  </>
                )}
              </Button>

              <Button
                onClick={handleClearViews}
                disabled={loading}
                variant="destructive"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Views
                  </>
                )}
              </Button>
            </div>

            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                {result.success ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      ✅ Success!
                    </p>
                    {result.viewsCreated !== undefined && (
                      <div className="text-sm text-green-800 dark:text-green-200">
                        <p>• Created {result.viewsCreated} property views</p>
                        <p>• For {result.buyersCount} buyer sessions</p>
                        <p>• Across {result.listingsCount} listings</p>
                        <p className="mt-2 font-medium">
                          🤖 AI match scores are being calculated in the background!
                        </p>
                        <p className="mt-1 text-xs">
                          Check Convex logs for progress. Scores will appear in dashboard tables shortly.
                        </p>
                      </div>
                    )}
                    {result.deletedCount !== undefined && (
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Deleted {result.deletedCount} property views
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100">
                      ❌ Error
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      {result.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">What Gets Generated:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Each buyer views 3-8 random properties</li>
                <li>View durations: 30 seconds to 10 minutes (realistic)</li>
                <li>Random image views (0-5 images per property)</li>
                <li>Random sections visited (details, gallery, neighborhood, etc.)</li>
                <li>Timestamps spread over last 7 days</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI Match Scoring:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Each view triggers an AI calculation</li>
                <li>Scores based on: Price (30%), Location (20%), Property Type (15%), Rooms (15%), Features (20%)</li>
                <li>Results cached in database for instant display</li>
                <li>View results in Buyer/Listing detail pages</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Where to See Results:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Dashboard → Buyers → [Select Buyer] → Property Activity table</li>
                <li>Dashboard → Listings → [Select Listing] → Buyer Activity table</li>
                <li>Look for color-coded match scores (Green 80%+, Yellow 60-79%, Red &lt;60%)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
