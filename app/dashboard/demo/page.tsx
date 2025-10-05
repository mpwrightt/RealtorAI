import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import DemoModeButton from "@/components/dashboard/demo-mode-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Home, FileText, TrendingUp } from "lucide-react";

export const metadata = {
  title: 'Demo Mode - Agent Dashboard',
  description: 'Generate demo data for presentations',
};

export default async function DemoPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Get user info
  const user = await fetchQuery(api.users.getUserByExternalId, {
    externalId: userId,
  });

  // Check if user is demo admin
  const isDemoAdmin = user?.name === "Matthew Wright" || 
                      (await fetchQuery(api.demoData.isDemoAdmin, { 
                        email: "mawrigh602@gmail.com" 
                      }));

  if (!isDemoAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Demo Mode - Access Denied
            </CardTitle>
            <CardDescription>
              This feature is only available for the demo admin account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get agent data
  const agent = await fetchQuery(api.agents.getAgentByUserId, {
    externalId: userId,
  });

  const stats = agent ? {
    listings: await fetchQuery(api.listings.getListingsByAgent, { 
      agentId: agent._id 
    }),
    buyerSessions: await fetchQuery(api.buyerSessions.getBuyerSessionsByAgent, { 
      agentId: agent._id 
    }),
    sellerSessions: await fetchQuery(api.sellerSessions.getSellerSessionsByAgent, { 
      agentId: agent._id 
    }),
  } : null;

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Demo Mode
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive demo data for presentations and testing
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Admin Access
        </Badge>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>What is Demo Mode?</CardTitle>
          <CardDescription>
            Demo Mode creates a complete, realistic dataset to showcase the platform's capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <Home className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">15 Property Listings</h3>
                <p className="text-sm text-muted-foreground">
                  Diverse properties across San Francisco with real addresses, photos, and details
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">5 Buyer Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Active buyer portals with different preferences and engagement levels
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">3 Seller Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Seller portals with analytics and offer tracking
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Complete Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  65+ property views, 5 offers, and interaction history
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Current Data Status</CardTitle>
            <CardDescription>Overview of your existing data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{stats.listings.length}</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{stats.buyerSessions.length}</div>
                <div className="text-sm text-muted-foreground">Buyer Sessions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{stats.sellerSessions.length}</div>
                <div className="text-sm text-muted-foreground">Seller Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generate Demo Data</CardTitle>
          <CardDescription>
            This will create or refresh your demo dataset. Any existing data will be replaced.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DemoModeButton userId={userId} userEmail="mawrigh602@gmail.com" />
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-sm">Demo Data Includes:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Premium listings from $975K to $6.75M across San Francisco</li>
            <li>• Buyer profiles with varied budgets and preferences</li>
            <li>• Active, pending, and sold property statuses</li>
            <li>• Property view analytics and engagement metrics</li>
            <li>• Offer submissions in various stages (pending, accepted, countered)</li>
            <li>• Agent interaction logs (calls, emails, meetings)</li>
            <li>• Session codes for easy portal access</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
