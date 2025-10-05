import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import ListingsTable from "@/components/dashboard/listings-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'My Listings - Agent Dashboard',
  description: 'Manage your property listings',
};

export default async function ListingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const agent = await fetchQuery(api.agents.getAgentByUserId, {
    externalId: userId,
  });

  if (!agent) {
    redirect('/dashboard');
  }

  const listings = await fetchQuery(api.listings.getListingsByAgent, {
    agentId: agent._id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Listings</h2>
          <p className="text-muted-foreground">
            {listings.length} total properties
          </p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        </Link>
      </div>

      <ListingsTable listings={listings} />
    </div>
  );
}
