import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { redirect } from "next/navigation";
import AgentStats from "@/components/dashboard/agent-stats";
import ActiveSessions from "@/components/dashboard/active-sessions";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import AgentOnboardingForm from "@/components/dashboard/agent-onboarding-form";

import MyDeals from "@/components/dashboard/my-deals";
import CommissionCalculator from "@/components/dashboard/commission-calculator";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Users, FileText, TrendingUp } from "lucide-react";

export const metadata = {
  title: 'Agent Dashboard - Neighborhood Deal Finder',
  description: 'Manage your listings and client sessions',
};

export default async function AgentDashboard() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Ensure user exists in Convex database
  await fetchMutation(api.users.getOrCreateUser, {
    externalId: userId,
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.emailAddresses[0]?.emailAddress || 'User',
  });

  const agent = await fetchQuery(api.agents.getAgentByUserId, {
    externalId: userId,
  });

  if (!agent) {
    return (
      <div className="container py-12">
        <div className="text-center mb-8">
          <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-3xl font-bold mb-2">Welcome to Neighborhood Deal Finder</h2>
          <p className="text-muted-foreground text-lg">
            Let's set up your agent profile to get started.
          </p>
        </div>

        <AgentOnboardingForm 
          userId={userId}
          userEmail={user.emailAddresses[0]?.emailAddress}
          userName={user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || undefined
          }
        />
      </div>
    );
  }

  const listings = await fetchQuery(api.listings.getListingsByAgent, {
    agentId: agent._id,
  });

  const buyerSessions = await fetchQuery(api.buyerSessions.getBuyerSessionsByAgent, {
    agentId: agent._id,
  });

  const sellerSessions = await fetchQuery(api.sellerSessions.getSellerSessionsByAgent, {
    agentId: agent._id,
  });

  const activeListings = listings.filter((l: any) => l.status === 'active');
  const activeBuyers = buyerSessions.filter((s: any) => s.active);
  
  // Create deals from listings and buyer sessions
  const deals = [
    ...activeListings.map((l: any) => ({
      _id: l._id,
      type: 'listing' as const,
      address: l.address,
      status: l.status === 'pending' ? 'under-contract' as const : 'listed' as const,
      dealValue: l.price,
      expectedCloseDate: undefined,
      daysActive: Math.floor((Date.now() - l.createdAt) / (1000 * 60 * 60 * 24)),
    })),
  ].slice(0, 10); // Limit to 10 most recent
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Welcome back, {agent.agencyName}!</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your properties
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                <p className="text-3xl font-bold mt-2">{activeListings.length}</p>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Buyers</p>
                <p className="text-3xl font-bold mt-2">{activeBuyers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seller Sessions</p>
                <p className="text-3xl font-bold mt-2">{sellerSessions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-3xl font-bold mt-2">{listings.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions agentId={agent._id} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MyDeals deals={deals} />
          <ActiveSessions 
            buyerSessions={buyerSessions}
            sellerSessions={sellerSessions}
          />
        </div>
        <div className="lg:col-span-1">
          <CommissionCalculator />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity agentId={agent._id} />
      </div>

      {/* Agent Stats */}
      <AgentStats 
        agent={agent} 
        listings={listings}
        buyerSessions={buyerSessions}
      />
    </div>
  );
}
