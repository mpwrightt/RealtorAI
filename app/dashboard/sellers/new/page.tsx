import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import CreateSellerSessionForm from "@/components/dashboard/create-seller-session-form";

export const metadata = {
  title: 'Create Seller Session - Agent Dashboard',
  description: 'Create a new seller portal session',
};

export default async function NewSellerSessionPage() {
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

  // Get agent's listings
  const listings = await fetchQuery(api.listings.getListingsByAgent, {
    agentId: agent._id,
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create Seller Session</h2>
        <p className="text-muted-foreground">
          Generate a personalized analytics portal for your seller client
        </p>
      </div>

      <CreateSellerSessionForm agentId={agent._id} listings={listings} />
    </div>
  );
}
